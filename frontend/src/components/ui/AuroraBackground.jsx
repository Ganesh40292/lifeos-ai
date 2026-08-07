import React, { useEffect, useRef } from 'react';
import './AuroraBackground.css';

/**
 * AuroraBackground — Ambient Enterprise SaaS Dashboard Background.
 * Renders a slow-moving indigo/violet aurora fog and subtle ambient stars
 * with automatic tab-visibility pausing, reduced motion compliance, and zero CPU waste.
 */
const AuroraBackground = React.memo(({
  gradientColors = [
    'rgba(99,102,241,0.18)',
    'rgba(139,92,246,0.14)'
  ],
  pulseDuration = 18,
  starCount = 25,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let isPaused = false;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set canvas dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate calm ambient stars
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speed: (Math.random() * 0.005 + 0.002) * (prefersReducedMotion ? 0 : 1),
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      if (isPaused) return;

      if (!prefersReducedMotion) {
        time += 0.005 / (pulseDuration / 18);
      }

      ctx.clearRect(0, 0, width, height);

      // Base dark background filling
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Primary Aurora Blob (Indigo)
      const x1 = width * 0.35 + Math.sin(time * 0.5) * 120;
      const y1 = height * 0.35 + Math.cos(time * 0.4) * 80;
      const r1 = Math.min(width, height) * 0.6;
      const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, r1);
      grad1.addColorStop(0, gradientColors[0] || 'rgba(99,102,241,0.18)');
      grad1.addColorStop(0.5, 'rgba(99,102,241,0.06)');
      grad1.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Secondary Aurora Blob (Violet)
      const x2 = width * 0.65 - Math.cos(time * 0.45) * 130;
      const y2 = height * 0.65 - Math.sin(time * 0.55) * 90;
      const r2 = Math.min(width, height) * 0.55;
      const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, r2);
      grad2.addColorStop(0, gradientColors[1] || 'rgba(139,92,246,0.14)');
      grad2.addColorStop(0.5, 'rgba(139,92,246,0.04)');
      grad2.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Ambient Stars
      stars.forEach((star) => {
        if (!prefersReducedMotion) {
          star.phase += star.speed;
        }
        const twilledAlpha = star.alpha + Math.sin(star.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0.05, Math.min(0.6, twilledAlpha))})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause animation when browser tab is inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        render();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gradientColors, pulseDuration, starCount]);

  return (
    <div className="aurora-bg-container">
      <canvas ref={canvasRef} className="aurora-bg-canvas" />
      <div className="aurora-dark-overlay" />
    </div>
  );
});

AuroraBackground.displayName = 'AuroraBackground';

export default AuroraBackground;
