'use client';

import React, { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
}

interface Particle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  color: string;
}

export default function SpiderWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for elastic web stretching
    const mouse = { x: -9999, y: -9999, radius: 160 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 1. Interactive Spider-Web Network Nodes
    let nodes: Node[] = [];
    const nodeCount = Math.min(Math.floor((width * height) / 28000), 55);

    function initNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: 1.5 + Math.random() * 1.5
        });
      }
    }
    initNodes();

    // 2. Spider-Verse Floating Embers / Sparks
    const particles: Particle[] = [];
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.45, // rise upwards
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
        color: Math.random() > 0.45 ? 'rgba(239, 68, 68, ' : 'rgba(56, 189, 248, '
      });
    }

    // Helper: Draw decorative corner spiderweb
    function drawCornerWeb(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
      if (!ctx) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.lineWidth = 1;

      const spokes = 7;
      const angleStep = (endAngle - startAngle) / (spokes - 1);

      // Spokes
      for (let i = 0; i < spokes; i++) {
        const a = startAngle + i * angleStep;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        ctx.stroke();
      }

      // Concentric web arches
      const rings = 5;
      for (let r = 1; r <= rings; r++) {
        const ringRad = (radius / rings) * r;
        ctx.beginPath();
        for (let i = 0; i < spokes; i++) {
          const a = startAngle + i * angleStep;
          const px = cx + Math.cos(a) * ringRad;
          const py = cy + Math.sin(a) * ringRad;
          if (i === 0) ctx.moveTo(px, py);
          else {
            // Slight curve inward for realistic sagging web
            const prevA = startAngle + (i - 1) * angleStep;
            const midA = (prevA + a) * 0.5;
            const sagRad = ringRad * 0.94;
            const cpx = cx + Math.cos(midA) * sagRad;
            const cpy = cy + Math.sin(midA) * sagRad;
            ctx.quadraticCurveTo(cpx, cpy, px, py);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    let animId = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle corner spiderwebs
      const cornerSize = Math.min(width * 0.28, 260);
      drawCornerWeb(0, 0, cornerSize, 0, Math.PI / 2);
      drawCornerWeb(width, 0, cornerSize, Math.PI / 2, Math.PI);

      // Update and draw floating embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Bounce gently at borders
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Mouse attraction & elastic stretch
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 0.08;
          n.x += dx * force;
          n.y += dy * force;
        } else {
          // Return gently to base trajectory
          n.x += (n.baseX - n.x) * 0.002;
          n.y += (n.baseY - n.y) * 0.002;
        }

        // Draw node
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connecting spider silk lines between nodes
      ctx.lineWidth = 0.85;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.26;
            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Connect nodes directly to cursor if nearby (spider silk stickiness!)
        if (mouse.x > 0) {
          const dx = mouse.x - nodes[i].x;
          const dy = mouse.y - nodes[i].y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.55;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none"
    />
  );
}
