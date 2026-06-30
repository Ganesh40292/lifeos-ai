import { useEffect, useRef } from 'react';

/**
 * Premium Interactive 3D Glass Orb Neural Network background.
 * Animates floating nodes in 3D space with soft glowing connection lines,
 * depth-based glass refraction radial highlights, dynamic mouse parallax tilt/pan,
 * and a slow-shifting ambient dark aurora foggy glow.
 */
const ThreeDBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stacking context fix: ensure canvas size changes on resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      // Normalize coordinate metrics (-1 to 1)
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Generate random 3D nodes inside a virtual cube box of size 650x650x650
    const numNodes = 58;
    const nodes = [];
    const boxSize = 650;

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * boxSize,
        y: (Math.random() - 0.5) * boxSize,
        z: (Math.random() - 0.5) * boxSize,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        vz: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 4 + 3.5, // physical node size (in pixels)
      });
    }

    // Camera settings
    const focalLength = 380;
    const cameraDistance = 500;
    const maxConnectionDist = 185; // maximum 3D distance to connect nodes
    let rotationY = 0;
    let rotationX = 0.25; // initial default pitch tilt
    let time = 0;

    const render = () => {
      time += 0.01;

      // Linear interpolation to smooth mouse coordinate tilt/panning
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;

      const currentRotationY = rotationY + mouseRef.current.x * 0.22;
      const currentRotationX = rotationX + mouseRef.current.y * 0.18;
      const cameraPanX = mouseRef.current.x * 55;
      const cameraPanY = mouseRef.current.y * 35;

      ctx.clearRect(0, 0, width, height);

      // 1. Detect active theme
      const isLight = document.documentElement.classList.contains('light-theme');

      // 2. Draw Moving Foggy Auroras inside the canvas itself for zero-CPU blend backgrounds
      const x1 = width * 0.2 + Math.sin(time * 0.15) * 160;
      const y1 = height * 0.3 + Math.cos(time * 0.2) * 110;
      const r1 = isLight ? 550 : 680;
      const grad1 = ctx.createRadialGradient(x1, y1, 20, x1, y1, r1);
      grad1.addColorStop(0, isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(99, 102, 241, 0.095)');
      grad1.addColorStop(0.5, isLight ? 'rgba(124, 58, 237, 0.05)' : 'rgba(124, 58, 237, 0.04)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const x2 = width * 0.8 - Math.cos(time * 0.18) * 160;
      const y2 = height * 0.7 - Math.sin(time * 0.22) * 130;
      const r2 = isLight ? 500 : 620;
      const grad2 = ctx.createRadialGradient(x2, y2, 20, x2, y2, r2);
      grad2.addColorStop(0, isLight ? 'rgba(124, 58, 237, 0.10)' : 'rgba(167, 139, 250, 0.08)');
      grad2.addColorStop(0.5, isLight ? 'rgba(6, 182, 212, 0.04)' : 'rgba(6, 182, 212, 0.03)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Primary styling base colors
      const strokeBase = isLight ? 'rgba(37, 99, 235, ' : 'rgba(99, 102, 241, ';     // Blue vs Indigo
      const accentBase = isLight ? 'rgba(124, 58, 237, ' : 'rgba(167, 139, 250, ';   // Violet vs Light Purple

      // 3. Project nodes coordinates to 2D
      const projected = [];
      const sinY = Math.sin(currentRotationY);
      const cosY = Math.cos(currentRotationY);
      const sinX = Math.sin(currentRotationX);
      const cosX = Math.cos(currentRotationX);

      nodes.forEach((n) => {
        // Floating movement (boundary cube limits collision detection)
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        const limit = boxSize / 2;
        if (Math.abs(n.x) > limit) n.vx *= -1;
        if (Math.abs(n.y) > limit) n.vy *= -1;
        if (Math.abs(n.z) > limit) n.vz *= -1;

        // Apply 3D coordinate rotation
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        // Adjust depth and add camera pan factor
        const depth = z2 + cameraDistance;

        if (depth > 60) {
          const screenX = (x1 + cameraPanX) * (focalLength / depth) + width / 2;
          const screenY = (y2 + cameraPanY) * (focalLength / depth) + height / 2;
          projected.push({ x: screenX, y: screenY, depth, radius: n.radius, original: n });
        } else {
          projected.push(null);
        }
      });

      // 4. Draw Soft Glowing Connection Lines
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (!p1) continue;

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (!p2) continue;

          // Calculate 3D euclidean distance between vertices
          const dx = p1.original.x - p2.original.x;
          const dy = p1.original.y - p2.original.y;
          const dz = p1.original.z - p2.original.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < maxConnectionDist) {
            // Opacity is proportional to proximity and proximity to focal field
            const proximityFactor = 1 - dist3D / maxConnectionDist;
            const avgDepth = (p1.depth + p2.depth) / 2;

            const maxDepth = cameraDistance + boxSize / 2;
            const minDepth = cameraDistance - boxSize / 2;
            let depthFactor = 1 - (avgDepth - minDepth) / (maxDepth - minDepth);
            depthFactor = Math.max(0, Math.min(1, depthFactor));

            let opacity = proximityFactor * depthFactor * 0.32;
            opacity = Math.max(0, Math.min(0.42, opacity));

            if (opacity > 0.01) {
              const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              lineGrad.addColorStop(0, strokeBase + opacity + ')');
              lineGrad.addColorStop(1, accentBase + (opacity * 0.7) + ')');
              
              // 1. Draw glowing background halo line
              ctx.beginPath();
              ctx.lineWidth = opacity * 14; // Wide line
              ctx.strokeStyle = strokeBase + (opacity * 0.18) + ')'; // Low opacity glow color
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();

              // 2. Draw sharp center core line
              ctx.beginPath();
              ctx.lineWidth = opacity * 2.8; // Thin sharp core
              ctx.strokeStyle = lineGrad;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // 5. Draw 3D Glass Orbs (Radial Gradients mimicking glass sphere highlights)
      projected.forEach((p) => {
        if (!p) return;

        // Size adapts dynamically to perspective depth
        const projectedSize = p.radius * (focalLength / p.depth);
        if (projectedSize < 0.5) return;

        // Calculate opacity based on camera depth
        const maxDepth = cameraDistance + boxSize / 2;
        const minDepth = cameraDistance - boxSize / 2;
        let opacity = 1 - (p.depth - minDepth) / (maxDepth - minDepth);
        opacity = Math.max(0.05, Math.min(0.75, opacity));

        // Create 3D spherical highlights gradient
        const highlightX = p.x - projectedSize * 0.28;
        const highlightY = p.y - projectedSize * 0.28;
        
        // 1. Draw soft pulsing outer halo glow for the orb
        ctx.beginPath();
        ctx.arc(p.x, p.y, projectedSize * 1.6, 0, Math.PI * 2);
        const haloGrad = ctx.createRadialGradient(
          p.x, p.y, projectedSize * 0.8,
          p.x, p.y, projectedSize * 1.6
        );
        haloGrad.addColorStop(0, strokeBase + (opacity * 0.25) + ')');
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // 2. Draw primary glass orb gradients
        ctx.beginPath();
        ctx.arc(p.x, p.y, projectedSize, 0, Math.PI * 2);

        const orbGrad = ctx.createRadialGradient(
          highlightX, highlightY, projectedSize * 0.05,
          p.x, p.y, projectedSize
        );
        
        // Highlights (shines) and shadows
        orbGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (opacity * 0.95) + ')'); // reflection spot
        orbGrad.addColorStop(0.18, strokeBase + (opacity * 0.6) + ')');           // primary color hue
        orbGrad.addColorStop(0.8, accentBase + (opacity * 0.22) + ')');          // shadow accent hue
        orbGrad.addColorStop(1, 'rgba(0, 0, 0, ' + (opacity * 0.6) + ')');        // dark shadow edge

        ctx.fillStyle = orbGrad;
        ctx.fill();

        // 3. Draw subtle outer glass ring boundary
        ctx.beginPath();
        ctx.arc(p.x, p.y, projectedSize, 0, Math.PI * 2);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = strokeBase + (opacity * 0.45) + ')';
        ctx.stroke();
      });

      // Slow orbital rotate rates
      rotationY += 0.00045;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        willChange: 'transform',
      }}
    />
  );
};

export default ThreeDBackground;
