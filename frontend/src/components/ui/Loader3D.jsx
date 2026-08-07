import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Heart, Coins, Briefcase, BarChart3, Bot, Sparkles 
} from 'lucide-react';
import clsx from 'clsx';

/**
 * Aetheria Neural Engine Initialization — Premium Cinematic Entry Loader
 * Sequences 5 cinematic phases mapping core system booting.
 */
const Loader3D = ({ show, onBootComplete }) => {
  const [phase, setPhase] = useState(1);
  const [activeIcons, setActiveIcons] = useState([]);
  
  // R = radial distance of module icons from center
  const R = 120;
  
  // 6 radial directions for module icons (in degrees)
  const iconsData = [
    { id: 'academics', label: 'ACADEMICS', icon: GraduationCap, angle: 18, color: 'shadow-blue-500/30 text-blue-400 border-blue-500/30' },
    { id: 'health', label: 'HEALTH', icon: Heart, angle: 90, color: 'shadow-rose-500/30 text-rose-400 border-rose-500/30' },
    { id: 'finance', label: 'FINANCES', icon: Coins, angle: 162, color: 'shadow-amber-500/30 text-amber-400 border-amber-500/30' },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3, angle: 234, color: 'shadow-purple-500/30 text-purple-400 border-purple-500/30' },
    { id: 'ai', label: 'AI ASSISTANT', icon: Bot, angle: 306, color: 'shadow-cyan-500/30 text-cyan-400 border-cyan-500/30' }
  ];

  // Helper to calculate radial coordinates relative to center (0,0)
  const getCoords = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: R * Math.cos(rad),
      y: R * Math.sin(rad)
    };
  };

  useEffect(() => {
    if (!show) return;

    // Timeline sequencing
    // Phase 1: 0s - Subtle background glow
    
    // Phase 2: 0.5s - Central Neural Core fades in
    const p2Timer = setTimeout(() => {
      setPhase(2);
    }, 500);

    // Phase 3: 1.1s - Sequential icon branching
    const p3Timer = setTimeout(() => {
      setPhase(3);
      
      // Light up icons one after another (every 200ms)
      iconsData.forEach((icon, index) => {
        setTimeout(() => {
          setActiveIcons((prev) => [...prev, icon.id]);
        }, index * 200);
      });
    }, 1100);

    // Phase 4: 2.6s - Absorb icons and transform to LifeOS Logo with ripple
    const p4Timer = setTimeout(() => {
      setPhase(4);
    }, 2600);

    // Phase 5: 3.6s - Signal initialization completion to start homepage expand reveal
    const p5Timer = setTimeout(() => {
      setPhase(5);
      if (onBootComplete) {
        onBootComplete();
      }
    }, 3600);

    return () => {
      clearTimeout(p2Timer);
      clearTimeout(p3Timer);
      clearTimeout(p4Timer);
      clearTimeout(p5Timer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090B] overflow-hidden select-none"
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Animated auroras */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <motion.div
              animate={{
                x: [0, 45, -30, 0],
                y: [0, -40, 50, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[-10%] left-[-10%] w-[380px] h-[380px] rounded-full bg-blue-500/10 blur-[130px]"
            />
            <motion.div
              animate={{
                x: [0, -50, 40, 0],
                y: [0, 50, -35, 0],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] rounded-full bg-purple-500/10 blur-[140px]"
            />
            <motion.div
              animate={{
                x: [0, 30, -45, 0],
                y: [0, 35, -40, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[30%] left-[30%] w-[320px] h-[320px] rounded-full bg-cyan-500/5 blur-[120px]"
            />
          </div>

          {/* Central Animation Area */}
          <div className="relative w-[340px] h-[340px] flex items-center justify-center">
            
            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              {iconsData.map((icon) => {
                const coords = getCoords(icon.angle);
                const isActive = activeIcons.includes(icon.id);
                const isAbsorbing = phase === 4;
                
                return (
                  <g key={icon.id}>
                    {/* Background faint path line */}
                    {phase >= 3 && !isAbsorbing && (
                      <line
                        x1="170"
                        y1="170"
                        x2={170 + coords.x}
                        y2={170 + coords.y}
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                      />
                    )}
                    
                    {/* Animated Connection Line */}
                    {phase >= 3 && !isAbsorbing && (
                      <motion.line
                        x1="170"
                        y1="170"
                        x2={170 + coords.x}
                        y2={170 + coords.y}
                        stroke="url(#lineGrad)"
                        strokeWidth="1.2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isActive ? { pathLength: 1, opacity: 0.5 } : {}}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    )}

                    {/* Flowing dots along connection lines */}
                    {isActive && !isAbsorbing && (
                      <motion.circle
                        cx={170}
                        cy={170}
                        r="2"
                        fill="#60a5fa"
                        style={{ filter: 'drop-shadow(0 0 4px #3b82f6)' }}
                        animate={{
                          x: [0, coords.x],
                          y: [0, coords.y],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: 'easeOut'
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Radial Module Icons */}
            {iconsData.map((item) => {
              const coords = getCoords(item.angle);
              const isActive = activeIcons.includes(item.id);
              const Icon = item.icon;
              const isAbsorbing = phase === 4;

              return (
                <AnimatePresence key={item.id}>
                  {phase >= 3 && isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, x: 0, y: 0 }}
                      animate={isAbsorbing 
                        ? { 
                            x: 0, 
                            y: 0, 
                            scale: 0.2, 
                            opacity: 0, 
                            filter: 'blur(4px)',
                            transition: { duration: 0.7, ease: [0.36, 0.07, 0.19, 0.97] } 
                          } 
                        : { 
                            x: coords.x, 
                            y: coords.y, 
                            scale: 1, 
                            opacity: 1,
                            transition: { type: 'spring', damping: 25, stiffness: 200 }
                          }
                      }
                      className={clsx(
                        "absolute w-11 h-11 rounded-full bg-[#111115]/80 backdrop-blur-md border flex items-center justify-center shadow-md",
                        item.color
                      )}
                      style={{
                        boxShadow: '0 0 15px rgba(255,255,255,0.01)'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}

            {/* Neural Core / AI Processor (Center) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={phase >= 2 ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-20 h-20 rounded-full flex items-center justify-center z-10"
            >
              {/* Outer soft glowing rings */}
              <div className="absolute inset-[-12px] rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-6px] rounded-full border border-cyan-500/15 animate-[spin_6s_linear_infinite_reverse]" />

              <motion.div 
                animate={phase === 4 
                  ? { 
                      scale: [1, 1.2, 0.9, 1],
                      boxShadow: [
                        '0 0 25px rgba(59, 130, 246, 0.3)',
                        '0 0 50px rgba(6, 182, 212, 0.7)',
                        '0 0 10px rgba(59, 130, 246, 0.2)'
                      ]
                    }
                  : {
                      boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.2)',
                        '0 0 35px rgba(6, 182, 212, 0.4)',
                        '0 0 20px rgba(59, 130, 246, 0.2)'
                      ]
                    }
                }
                transition={{ 
                  duration: phase === 4 ? 0.9 : 3, 
                  repeat: phase === 4 ? 0 : Infinity, 
                  ease: 'easeInOut' 
                }}
                className="w-full h-full rounded-full bg-[#111115] border border-blue-500/30 flex items-center justify-center relative overflow-hidden"
              >
                {/* Ambient dynamic micro lines inside the processor core */}
                <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: '12s' }} />

                <AnimatePresence mode="wait">
                  {phase < 4 ? (
                    // Neural AI Core Processor Icon
                    <motion.div
                      key="core-icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-cyan-400"
                    >
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </motion.div>
                  ) : (
                    // Morphed LifeOS Logo
                    <motion.div
                      key="logo-icon"
                      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className="text-white drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                    >
                      {/* Premium stylized minimalist LifeOS Zap icon */}
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Expanding Energy Ripple (Wave) in Phase 4 */}
            {phase === 4 && (
              <motion.div
                initial={{ scale: 0.4, opacity: 0.8 }}
                animate={{ scale: 4.5, opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute w-20 h-20 rounded-full border-2 border-blue-500/50 pointer-events-none"
                style={{
                  boxShadow: '0 0 30px rgba(59,130,246,0.4), inset 0 0 20px rgba(6, 182, 212, 0.2)'
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader3D;
