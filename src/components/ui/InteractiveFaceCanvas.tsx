'use client';

import React, { useRef, useEffect } from 'react';

const TOTAL_FRAMES = 69; // 0 to 68
const CENTER_FRAME = 34; // Exact center frame (faces straight at camera)

interface InteractiveFaceCanvasProps {
  className?: string;
}

export default function InteractiveFaceCanvas({ className = '' }: InteractiveFaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Physics animation refs
  const targetFrameRef = useRef<number>(CENTER_FRAME);
  const currentFrameRef = useRef<number>(CENTER_FRAME);
  const targetTiltXRef = useRef<number>(0);
  const targetTiltYRef = useRef<number>(0);
  const currentTiltXRef = useRef<number>(0);
  const currentTiltYRef = useRef<number>(0);
  const animFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const drawFrame = (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));
      const img = imagesRef.current[idx];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    // Preload 69 frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new window.Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/frames/frame_${numStr}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (i === CENTER_FRAME || loadedCount === 1) {
          drawFrame(CENTER_FRAME);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    // 60FPS animation loop with LERP smoothing
    const animate = () => {
      const diffFrame = targetFrameRef.current - currentFrameRef.current;
      currentFrameRef.current += diffFrame * 0.15;

      currentTiltXRef.current += (targetTiltXRef.current - currentTiltXRef.current) * 0.1;
      currentTiltYRef.current += (targetTiltYRef.current - currentTiltYRef.current) * 0.1;

      drawFrame(currentFrameRef.current);

      if (containerRef.current) {
        containerRef.current.style.transform = `perspective(800px) rotateX(${currentTiltXRef.current.toFixed(2)}deg) rotateY(${currentTiltYRef.current.toFixed(2)}deg) translateZ(0)`;
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Mouse Tracking across screen
    const updateTargetFromCoord = (clientX: number, clientY: number) => {
      const w = window.innerWidth || document.documentElement.clientWidth;
      const h = window.innerHeight || document.documentElement.clientHeight;

      // 0 (Far Left) -> 0.5 (Center) -> 1.0 (Far Right)
      const normX = Math.max(0, Math.min(1, clientX / w));
      targetFrameRef.current = normX * (TOTAL_FRAMES - 1);

      // 3D subtle tilt
      const relX = (clientX - w / 2) / (w / 2);
      const relY = (clientY - h / 2) / (h / 2);

      targetTiltYRef.current = relX * 10;
      targetTiltXRef.current = -relY * 8;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateTargetFromCoord(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        updateTargetFromCoord(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseLeave = () => {
      targetFrameRef.current = CENTER_FRAME;
      targetTiltXRef.current = 0;
      targetTiltYRef.current = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ willChange: 'transform' }}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full h-full object-cover"
      />
      {/* Subtle ambient lens flare overlay */}
      <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_25px_rgba(249,115,22,0.2)] mix-blend-screen" />
    </div>
  );
}
