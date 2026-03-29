import { useEffect, useRef } from 'react';

export function MouseParallax() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    interface Particle {
      baseX: number; baseY: number;
      x: number; y: number;
      size: number; length: number; angle: number;
      color: string; depth: number; opacity: number;
      driftX: number; driftY: number;
      vx: number; vy: number;
    }
    const particles: Particle[] = [];
    // Muted blue, purple, pink colors resembling the reference image
    const colors = ['#818cf8', '#c084fc', '#f472b6', '#38bdf8', '#fb7185'];

    const initParticles = () => {
      particles.length = 0;
      const spacing = 35; // Decreased spacing for higher density
      const cols = Math.ceil(width / spacing) + 4;
      const rows = Math.ceil(height / spacing) + 4;

      for (let i = -2; i < cols; i++) {
        for (let j = -2; j < rows; j++) {
          // 85% chance to spawn (more particles)
          if (Math.random() > 0.85) continue;

          // Add slight jitter to the exact grid position
          const baseX = i * spacing + (Math.random() * 15 - 7.5);
          const baseY = j * spacing + (Math.random() * 15 - 7.5);

          particles.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            size: Math.random() * 2 + 1.5, // slightly thicker
            length: Math.random() * 8 + 4,
            angle: -Math.PI / 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            depth: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.5, // Increased base opacity (0.5 to 0.9)
            driftX: (Math.random() - 0.5) * 0.15,
            driftY: (Math.random() - 0.5) * 0.15,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    initParticles();

    let animationFrameId: number;

    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const mouseOffsetX = (mouseX - width / 2);
      const mouseOffsetY = (mouseY - height / 2);

      particles.forEach(p => {
        // Continuous slow drift
        p.baseX += p.driftX;
        p.baseY += p.driftY;

        // Wrap around
        if (p.baseX > width + 100) p.baseX = -100;
        if (p.baseX < -100) p.baseX = width + 100;
        if (p.baseY > height + 100) p.baseY = -100;
        if (p.baseY < -100) p.baseY = height + 100;

        // Base target position with parallax
        let targetX = p.baseX - (mouseOffsetX * p.depth * 0.03);
        let targetY = p.baseY - (mouseOffsetY * p.depth * 0.03);

        // Repulsion logic
        const dx = targetX - mouseX;
        const dy = targetY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 150;

        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          // Push outward from the mouse
          targetX += (dx / dist) * force * 40; 
          targetY += (dy / dist) * force * 40;
        }

        // Spring physics to move toward targetX/targetY
        p.vx += (targetX - p.x) * 0.05;
        p.vy += (targetY - p.y) * 0.05;
        p.vx *= 0.8; // friction
        p.vy *= 0.8;
        
        p.x += p.vx;
        p.y += p.vy;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-p.length / 2, -p.size / 2, p.length, p.size, p.size);
        } else {
          ctx.rect(-p.length / 2, -p.size / 2, p.length, p.size);
        }
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
