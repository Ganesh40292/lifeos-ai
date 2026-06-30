import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Hourglass, Flame, Brain, Calendar, Info
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ThreeDTimer from '@/components/focus/ThreeDTimer';
import { focusService } from '@/services/focusService';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';

const SESSION_TYPES = {
  FOCUS: { label: 'Focus Session', minutes: 25, color: 'text-primary', badge: 'bg-primary/20 border-primary/30', xp: 50 },
  SHORT: { label: 'Short Break', minutes: 5, color: 'text-success', badge: 'bg-success/20 border-success/30', xp: 0 },
  LONG: { label: 'Long Break', minutes: 15, color: 'text-warning', badge: 'bg-warning/20 border-warning/30', xp: 0 },
};

const FocusPage = () => {
  const { user, refreshUser } = useAuth();
  
  const [sessionType, setSessionType] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(SESSION_TYPES.FOCUS.minutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Ambient sound synthesizer states
  const [ambientSound, setAmbientSound] = useState('NONE'); // 'NONE' | 'RAIN' | 'OCEAN' | 'DRONE'
  const [audioVolume, setAudioVolume] = useState(0.4);

  // Web Audio Context refs
  const audioCtxRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const droneOscsRef = useRef([]);

  // Initialize countdown on session type swap
  useEffect(() => {
    setTimeLeft(SESSION_TYPES[sessionType].minutes * 60);
    setTimerRunning(false);
  }, [sessionType]);

  // Main countdown timer loop
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Fetch session history logs on mount
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await focusService.getSessions();
      setSessionHistory(data);
    } catch (err) {
      console.error('Failed to load focus history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Web Audio Synthesis management
  useEffect(() => {
    if (timerRunning && ambientSound !== 'NONE') {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }
    return () => stopAmbientAudio();
  }, [timerRunning, ambientSound]);

  // Dynamically update audio gain volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(audioVolume, audioCtxRef.current.currentTime);
    }
  }, [audioVolume]);

  const startAmbientAudio = () => {
    try {
      stopAmbientAudio();
      
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(audioVolume, audioCtxRef.current.currentTime);
      gainNodeRef.current.connect(audioCtxRef.current.destination);

      if (ambientSound === 'RAIN' || ambientSound === 'OCEAN') {
        // Generate high-performance white noise buffer
        const bufferSize = 2 * audioCtxRef.current.sampleRate;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (ambientSound === 'RAIN') {
            // Low-pass brownian filter to simulate rain/waterfall
            output[i] = (lastOut + (0.018 * white)) / 1.018;
            lastOut = output[i];
            output[i] *= 4.5;
          } else {
            // Pink-ish noise formula for ocean waves
            output[i] = (lastOut + (0.12 * white)) / 1.12;
            lastOut = output[i];
            output[i] *= 2.5;
          }
        }

        const bufferSource = audioCtxRef.current.createBufferSource();
        bufferSource.buffer = noiseBuffer;
        bufferSource.loop = true;

        const filter = audioCtxRef.current.createBiquadFilter();

        if (ambientSound === 'RAIN') {
          filter.type = 'lowpass';
          filter.frequency.value = 450;
        } else {
          // Ocean waves filter sweeping modulated by LFO
          filter.type = 'bandpass';
          filter.frequency.value = 400;
          filter.Q.value = 1.5;

          // Ocean swell modulation LFO
          const lfo = audioCtxRef.current.createOscillator();
          const lfoGain = audioCtxRef.current.createGain();
          
          lfo.frequency.value = 0.12; // slow waves: 8-second cycles
          lfoGain.gain.value = 220; // range of cutoff sweep

          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          lfo.start();
        }

        bufferSource.connect(filter);
        filter.connect(gainNodeRef.current);
        bufferSource.start();

        noiseSourceRef.current = bufferSource;
      } else if (ambientSound === 'DRONE') {
        // Synthesize deep soothing detuned binaural drone
        const osc1 = audioCtxRef.current.createOscillator();
        const osc2 = audioCtxRef.current.createOscillator();
        const lowpass = audioCtxRef.current.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 110; // A2 note
        
        osc2.type = 'triangle';
        osc2.frequency.value = 110.35; // detune for soft phasing beats

        lowpass.type = 'lowpass';
        lowpass.frequency.value = 120; // cut harsh high frequencies

        osc1.connect(lowpass);
        osc2.connect(lowpass);
        lowpass.connect(gainNodeRef.current);

        osc1.start();
        osc2.start();

        droneOscsRef.current = [osc1, osc2];
      }
    } catch (e) {
      console.warn('Audio Context failed to play ambient synthesis:', e);
    }
  };

  const stopAmbientAudio = () => {
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (droneOscsRef.current.length > 0) {
      droneOscsRef.current.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
      droneOscsRef.current = [];
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  // Synthesize a pleasant bell chime using native Web Audio
  const playBellChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6); // smooth slide

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8); // fade out

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {
      console.warn('Bell chime synthesis failed:', e);
    }
  };

  const handleTimerComplete = async () => {
    playBellChime();

    if (sessionType === 'FOCUS') {
      try {
        await focusService.createSession({
          durationMinutes: SESSION_TYPES.FOCUS.minutes,
          completed: true
        });
        
        // Update user context dynamically for gamified XP bar updates!
        await refreshUser();
        // Refresh session logs
        fetchHistory();
      } catch (err) {
        console.error('Failed to save focus session:', err);
      }
    }

    // Toggle states: Focus -> Short Break, Break -> Focus
    if (sessionType === 'FOCUS') {
      setSessionType('SHORT');
    } else {
      setSessionType('FOCUS');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate statistics
  const totalFocusMinutes = sessionHistory
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const totalSessionsCount = sessionHistory.filter(s => s.completed).length;

  const currentMinutesPercentage = timeLeft / (SESSION_TYPES[sessionType].minutes * 60);

  return (
    <div className="page-container relative max-w-5xl mx-auto">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title text-2xl md:text-3xl font-bold tracking-tight">
            Focus Room 🪐
          </h1>
          <p className="page-subtitle text-sm text-text-muted mt-1">
            Dive into deep study, block out external noise, and earn experience points.
          </p>
        </div>

        {/* Level XP Info Card */}
        {user && (
          <div className="flex items-center gap-4 bg-bg-card/70 border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-text">Lvl.{user.level}</span>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-text-muted font-medium mt-0.5">{user.xp} XP / {user.level * 100} XP</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid Layout: Timer Panel (Left) vs Stats/History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col — Pomodoro Canvas and Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 flex flex-col items-center relative overflow-hidden bg-bg-card/65 backdrop-blur-md border border-border/70 hover:shadow-xl transition-all duration-300">
            
            {/* Session Type Select Toggles */}
            <div className="flex items-center bg-gray-950/60 p-1.5 rounded-xl border border-gray-800/80 mb-6 z-10">
              {Object.entries(SESSION_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setSessionType(key)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    sessionType === key
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {val.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* 3D Cylinder Visual Canvas */}
            <ThreeDTimer percentage={currentMinutesPercentage} timerRunning={timerRunning} />

            {/* Timer digits */}
            <div className="text-5xl md:text-6xl font-mono font-bold tracking-widest text-text mt-2 mb-4 bg-gray-950/70 border border-gray-800/50 px-8 py-4 rounded-2xl min-w-[210px] text-center shadow-inner select-none z-10">
              {formatTime(timeLeft)}
            </div>

            <span className="text-xs text-text-faint flex items-center gap-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {sessionType === 'FOCUS' ? 'Earn +50 XP upon session completion' : 'Enjoy your well-deserved break!'}
            </span>

            {/* Start/Stop Controls */}
            <div className="flex items-center gap-4 z-10">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  timerRunning
                    ? 'bg-gray-800 text-text hover:bg-gray-700 shadow-md'
                    : 'bg-primary text-white hover:bg-primary-light hover:scale-105 shadow-lg shadow-primary/20'
                }`}
              >
                {timerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>
              
              <button
                onClick={() => setTimeLeft(SESSION_TYPES[sessionType].minutes * 60)}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-950 border border-gray-850 hover:bg-gray-800 hover:text-text text-text-muted transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Ambient Noise Synthesizer Card */}
          <Card className="p-5 bg-bg-card/65 backdrop-blur-md border border-border/70">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-text flex items-center gap-2">
                <Volume2 className="w-4.5 h-4.5 text-primary" /> Binaural Focus Synthesizer
              </span>
              <div className="flex items-center gap-1 bg-gray-950/60 p-1 rounded-lg border border-gray-800/80">
                {['NONE', 'RAIN', 'OCEAN', 'DRONE'].map((sound) => (
                  <button
                    key={sound}
                    onClick={() => setAmbientSound(sound)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase cursor-pointer transition-colors ${
                      ambientSound === sound
                        ? 'bg-primary/20 text-primary border border-primary/20'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {sound === 'NONE' ? 'Off' : sound}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control slider */}
            {ambientSound !== 'NONE' ? (
              <div className="flex items-center gap-3 p-2 bg-gray-950/20 rounded-lg border border-gray-850/30 animate-[fade-in_0.2s_ease-out]">
                <VolumeX className="w-4 h-4 text-text-faint" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <Volume2 className="w-4 h-4 text-text-muted" />
              </div>
            ) : (
              <p className="text-[11px] text-text-faint flex items-center gap-1.5 px-1 leading-relaxed">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Web Audio soundscapes compile white noise equations on-the-fly. Choose a synthesizer option to block out external sounds.
              </p>
            )}
          </Card>
        </div>

        {/* Right Col — Stats & Focus Session Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Stats overview card */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-bg-card/65 backdrop-blur-md border border-border/70 flex flex-col justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Hourglass className="w-4.5 h-4.5 text-primary" /> Focus Time
              </span>
              <div className="mt-4">
                <span className="text-2xl font-mono font-bold text-text">{totalFocusMinutes}</span>
                <span className="text-xs text-text-muted ml-1">mins</span>
              </div>
            </Card>

            <Card className="p-4 bg-bg-card/65 backdrop-blur-md border border-border/70 flex flex-col justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4.5 h-4.5 text-warning" /> Sessions
              </span>
              <div className="mt-4">
                <span className="text-2xl font-mono font-bold text-text">{totalSessionsCount}</span>
                <span className="text-xs text-text-muted ml-1">intervals</span>
              </div>
            </Card>
          </div>

          {/* Completed session logs list */}
          <Card className="p-5 bg-bg-card/65 backdrop-blur-md border border-border/70 flex flex-col min-h-[300px]">
            <span className="text-sm font-bold text-text mb-4 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-primary" /> Session History Logs
            </span>

            {loadingHistory ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : sessionHistory.length > 0 ? (
              <div className="flex-1 overflow-y-auto max-h-[320px] space-y-3 pr-1">
                {sessionHistory.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated/40 border border-border/50 hover:bg-bg-elevated/65 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {session.durationMinutes}m
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text block">Focus Session Log</span>
                        <span className="text-[10px] text-text-faint block mt-0.5">
                          {formatDate(session.createdAt || new Date(), {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-success bg-success/15 border border-success/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <Flame className="w-3 h-3" /> +50 XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/40 rounded-xl bg-bg-elevated/10">
                <Hourglass className="w-8 h-8 text-text-faint mb-2" />
                <span className="text-xs font-bold text-text-muted">No completed logs yet</span>
                <p className="text-[10px] text-text-faint mt-1 max-w-[200px]">
                  Start the countdown timer and complete your first 25-minute study block to log it.
                </p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default FocusPage;
