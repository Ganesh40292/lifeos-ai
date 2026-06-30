import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { focusService } from '@/services/focusService';

const SESSION_TYPES = {
  FOCUS: { label: 'Focus', minutes: 25, color: 'text-info', badge: 'bg-info/20 border-info/30' },
  SHORT: { label: 'Short Break', minutes: 5, color: 'text-success', badge: 'bg-success/20 border-success/30' },
  LONG: { label: 'Long Break', minutes: 15, color: 'text-warning', badge: 'bg-warning/20 border-warning/30' },
};

const PomodoroTimer = ({ onSessionComplete }) => {
  const [sessionType, setSessionType] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(SESSION_TYPES.FOCUS.minutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Ambient audio state
  const [ambientSound, setAmbientSound] = useState('NONE'); // 'NONE' | 'RAIN' | 'WHITE'
  const [audioVolume, setAudioVolume] = useState(0.5);
  
  const audioCtxRef = useRef(null);
  const soundNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize values when session type changes
  useEffect(() => {
    setTimeLeft(SESSION_TYPES[sessionType].minutes * 60);
    setTimerRunning(false);
  }, [sessionType]);

  // Main Timer Countdown loop
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

  // Handle ambient sound playback when selection or running state changes
  useEffect(() => {
    if (timerRunning && ambientSound !== 'NONE') {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [timerRunning, ambientSound]);

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(audioVolume, audioCtxRef.current.currentTime);
    }
  }, [audioVolume]);

  const handleTimerComplete = async () => {
    // Play alert sound using Web Audio synthesizer (a simple pleasant bell chime)
    playBellSound();

    if (sessionType === 'FOCUS') {
      try {
        await focusService.createSession({
          durationMinutes: SESSION_TYPES.FOCUS.minutes,
          completed: true
        });
        if (onSessionComplete) onSessionComplete();
      } catch (err) {
        console.error('Failed to log focus session:', err);
      }
    }
    
    // Switch states: Focus -> Short Break
    if (sessionType === 'FOCUS') {
      setSessionType('SHORT');
    } else {
      setSessionType('FOCUS');
    }
  };

  // Synthesize a pleasant bell chime using Web Audio
  const playBellSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Fall to A4
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn('Audio Context failed to play chime:', e);
    }
  };

  // Web Audio Noise Generator (White & Pink/Brownish for Rain)
  const startAmbientSound = () => {
    try {
      stopAmbientSound();
      
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      
      const bufferSize = 2 * audioCtxRef.current.sampleRate;
      const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (ambientSound === 'RAIN') {
          // Brown/Pink filter simulation for rain/waterfall sound
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain adjustment
        } else {
          // Pure white noise
          output[i] = white * 0.5;
        }
      }
      
      const whiteNoise = audioCtxRef.current.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = ambientSound === 'RAIN' ? 'lowpass' : 'bandpass';
      filter.frequency.value = ambientSound === 'RAIN' ? 400 : 800;
      
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(audioVolume, audioCtxRef.current.currentTime);
      
      whiteNoise.connect(filter);
      filter.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      
      whiteNoise.start();
      soundNodeRef.current = whiteNoise;
    } catch (e) {
      console.warn('Web Audio synthesis initialization failed:', e);
    }
  };

  const stopAmbientSound = () => {
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop();
      } catch (e) {}
      soundNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      {/* Session selector */}
      <div className="flex items-center bg-gray-950/60 p-1.5 rounded-xl border border-gray-800/80 mb-6">
        {Object.entries(SESSION_TYPES).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSessionType(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              sessionType === key
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {value.label}
          </button>
        ))}
      </div>

      {/* Countdown Box */}
      <div className="text-6xl font-mono font-bold text-white mb-3 tracking-widest bg-gray-950/80 px-8 py-5 rounded-2xl border border-gray-800/50 shadow-inner min-w-[200px]">
        {formatTime(timeLeft)}
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-6 justify-center">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        {SESSION_TYPES[sessionType].label} Session ({SESSION_TYPES[sessionType].minutes} mins)
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setTimerRunning(!timerRunning)}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            timerRunning
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
          }`}
        >
          {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
        </button>
        <button
          onClick={() => setTimeLeft(SESSION_TYPES[sessionType].minutes * 60)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-950 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Ambient Audio Options */}
      <div className="w-full bg-gray-950/30 p-4 rounded-xl border border-gray-800/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" /> Focus Ambience
          </span>
          <div className="flex items-center gap-1.5">
            {['NONE', 'RAIN', 'WHITE'].map((type) => (
              <button
                key={type}
                onClick={() => setAmbientSound(type)}
                className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                  ambientSound === type
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {type === 'NONE' ? 'Off' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Slider */}
        {ambientSound !== 'NONE' && (
          <div className="flex items-center gap-2 mt-2">
            <VolumeX className="w-3.5 h-3.5 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioVolume}
              onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
