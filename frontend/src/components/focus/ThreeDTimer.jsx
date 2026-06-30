import { useEffect, useRef } from 'react';

/**
 * Breathtaking 3D Glass Cylinder countdown visualizer.
 * Renders a transparent glass container in 3D space containing a colored glowing
 * fluid fill that drains dynamically, complete with fluid waves and rising bubbles.
 * Also supports responsive resizing and mouse hover tilt parallax.
 */
const ThreeDTimer = ({ percentage, timerRunning }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement.clientHeight || 300);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = canvasRef.current.parentElement.clientWidth || 300;
      height = canvasRef.current.height = canvasRef.current.parentElement.clientHeight || 300;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.targetX = (x / rect.width) * 2 - 1;
      mouseRef.current.targetY = (y / rect.height) * 2 - 1;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 3D Cylinder geometry settings
    const cylinderRadius = 75;
    const cylinderHeight = 160;
    const cameraDistance = 320;
    const focalLength = 300;
    
    let rotationY = 0;
    let rotationX = 0.35; // Default tilt look down
    let time = 0;

    // Bubbles array for rising focus particles
    const bubbles = [];
    const maxBubbles = 16;

    const render = () => {
      time += 0.025;
      
      // Interpolate mouse coordinates (physics damping)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const currentRotationY = rotationY + mouseRef.current.x * 0.35;
      const currentRotationX = rotationX + mouseRef.current.y * 0.3;

      ctx.clearRect(0, 0, width, height);

      // Determine active theme colors
      const isLight = document.documentElement.classList.contains('light-theme');
      const glassColor = isLight ? 'rgba(59, 130, 246, ' : 'rgba(99, 102, 241, ';
      const liquidColor1 = isLight ? 'rgba(37, 99, 235, ' : 'rgba(99, 102, 241, ';
      const liquidColor2 = isLight ? 'rgba(124, 58, 237, ' : 'rgba(167, 139, 250, ';

      // Helper to project 3D point (x, y, z) into 2D screen coordinate
      const project = (x, y, z) => {
        // Rotate Y axis
        const cosY = Math.cos(currentRotationY);
        const sinY = Math.sin(currentRotationY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate X axis
        const cosX = Math.cos(currentRotationX);
        const sinX = Math.sin(currentRotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const depth = z2 + cameraDistance;
        const screenX = x1 * (focalLength / depth) + width / 2;
        const screenY = y2 * (focalLength / depth) + height / 2;

        return { x: screenX, y: screenY, depth };
      };

      // Helper to draw a circle ring in 3D space
      const draw3DCircle = (yVal, colorStr, lineWidthVal = 1, isSolid = false, solidPercentage = 1) => {
        const segments = 60;
        const pts = [];
        
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const px = Math.cos(angle) * cylinderRadius;
          const pz = Math.sin(angle) * cylinderRadius;
          pts.push(project(px, yVal, pz));
        }

        ctx.beginPath();
        ctx.lineWidth = lineWidthVal;

        // Apply depth-based shading by slicing and rendering arcs
        for (let i = 0; i < segments; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          
          if (!p1 || !p2) continue;

          // Back edges are thinner and less opaque than front edges (depth cue)
          const avgDepth = (p1.depth + p2.depth) / 2;
          const maxD = cameraDistance + cylinderRadius;
          const minD = cameraDistance - cylinderRadius;
          let factor = 1 - (avgDepth - minD) / (maxD - minD);
          factor = Math.max(0.12, Math.min(0.9, factor));

          ctx.beginPath();
          ctx.strokeStyle = colorStr + (factor * (isSolid ? solidPercentage : 0.45)) + ')';
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      };

      // Draw Glass Cylinder Frame (Structure)
      // Intermediate vertical lines connecting top and bottom
      const drawCylinderBridges = () => {
        const bridgesCount = 8;
        for (let i = 0; i < bridgesCount; i++) {
          const angle = (i / bridgesCount) * Math.PI * 2;
          const cx = Math.cos(angle) * cylinderRadius;
          const cz = Math.sin(angle) * cylinderRadius;

          const topP = project(cx, -cylinderHeight / 2, cz);
          const bottomP = project(cx, cylinderHeight / 2, cz);

          const avgDepth = (topP.depth + bottomP.depth) / 2;
          const maxD = cameraDistance + cylinderRadius;
          const minD = cameraDistance - cylinderRadius;
          let factor = 1 - (avgDepth - minD) / (maxD - minD);
          factor = Math.max(0.15, Math.min(0.85, factor));

          ctx.beginPath();
          ctx.lineWidth = factor * 1.5;
          ctx.strokeStyle = glassColor + (factor * 0.22) + ')';
          ctx.moveTo(topP.x, topP.y);
          ctx.lineTo(bottomP.x, bottomP.y);
          ctx.stroke();
        }
      };

      // Render countdown liquid inside cylinder
      const drawLiquid = () => {
        if (percentage <= 0) return;

        // Bottom of cylinder is at y = cylinderHeight/2. Top is at -cylinderHeight/2
        const liquidTopY = (cylinderHeight / 2) - (cylinderHeight * percentage);
        const liquidBottomY = cylinderHeight / 2;

        const segments = 45;
        const topRingPoints = [];
        const bottomRingPoints = [];

        // Apply a wave phase factor
        const waveAmp = timerRunning ? 3.8 : 1.2;

        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const px = Math.cos(angle) * (cylinderRadius - 1.8);
          const pz = Math.sin(angle) * (cylinderRadius - 1.8);

          // Liquid top surface waves
          const waveHeight = Math.sin(angle * 3.5 + time) * waveAmp;
          topRingPoints.push(project(px, liquidTopY + waveHeight, pz));
          bottomRingPoints.push(project(px, liquidBottomY, pz));
        }

        // Draw the vertical solid fluid panels (slicing)
        for (let i = 0; i < segments; i++) {
          const t1 = topRingPoints[i];
          const t2 = topRingPoints[i + 1];
          const b1 = bottomRingPoints[i];
          const b2 = bottomRingPoints[i + 1];

          if (!t1 || !t2 || !b1 || !b2) continue;

          // Depth shading
          const avgDepth = (t1.depth + t2.depth) / 2;
          const maxD = cameraDistance + cylinderRadius;
          const minD = cameraDistance - cylinderRadius;
          let factor = 1 - (avgDepth - minD) / (maxD - minD);
          factor = Math.max(0.2, Math.min(0.9, factor));

          // Draw slice shape
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.lineTo(b1.x, b1.y);
          ctx.closePath();

          const grad = ctx.createLinearGradient(t1.x, t1.y, b1.x, b1.y);
          grad.addColorStop(0, liquidColor1 + (factor * 0.42) + ')');
          grad.addColorStop(1, liquidColor2 + (factor * 0.16) + ')');
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Render the fluid top surface ellipse
        ctx.beginPath();
        topRingPoints.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = liquidColor1 + '0.45)';
        ctx.fill();

        // Draw liquid surface reflection ring
        ctx.beginPath();
        topRingPoints.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = liquidColor2 + '0.65)';
        ctx.stroke();
      };

      // Manage and render bubbles rising
      const manageBubbles = () => {
        if (!timerRunning || percentage <= 0) return;

        // Randomly generate bubbles
        if (bubbles.length < maxBubbles && Math.random() < 0.12) {
          // Spawn near bottom of cylinder
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (cylinderRadius - 8);
          bubbles.push({
            x: Math.cos(angle) * dist,
            y: cylinderHeight / 2,
            z: Math.sin(angle) * dist,
            speed: Math.random() * 0.8 + 0.6,
            radius: Math.random() * 1.8 + 0.8,
            wobbleSpeed: Math.random() * 0.1 + 0.05,
            wobbleAmp: Math.random() * 2 + 1,
            seed: Math.random() * 100,
          });
        }

        const liquidTopY = (cylinderHeight / 2) - (cylinderHeight * percentage);

        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.speed;

          // Remove if it rises above liquid surface
          if (b.y < liquidTopY) {
            bubbles.splice(i, 1);
            continue;
          }

          // Add slight horizontal wobble wave
          const currentX = b.x + Math.sin(time * 2.5 + b.seed) * b.wobbleAmp * 0.3;
          const proj = project(currentX, b.y, b.z);

          if (proj) {
            // Draw bubble highlight bubble
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, b.radius * (focalLength / proj.depth), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fill();
            
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.stroke();
          }
        }
      };

      // Draw everything in depth sorting order
      draw3DCircle(cylinderHeight / 2, glassColor, 2, false); // Bottom glass ring
      drawLiquid(); // Countdown fluid
      manageBubbles(); // Rising bubbles
      drawCylinderBridges(); // Vertical struts
      draw3DCircle(-cylinderHeight / 2, glassColor, 2.5, false); // Top glass ring
      
      // Glass highlight rings
      draw3DCircle(-cylinderHeight * 0.15, glassColor, 0.75, false);
      draw3DCircle(cylinderHeight * 0.15, glassColor, 0.75, false);

      // Slow passive rotation
      rotationY += 0.0035;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [percentage, timerRunning]);

  return (
    <div className="relative w-full h-[280px] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default ThreeDTimer;
