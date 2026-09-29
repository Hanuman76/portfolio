'use client';

import React, { useRef, useEffect, useState } from 'react';

interface WebShot {
  id: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1 shoot animation
  pullPhase: number; // 0 to 1 elastic pull tension
  alpha: number; // 1 to 0 fade out
  tensionFreq: number;
  tensionAmp: number;
  splatRadius: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
  }>;
}

// Synthesize authentic Spider-Man "THWIP!" web shooter sound using Web Audio API
class SpideySoundFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playThwip() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. High-pressure gas/silk discharge noise burst
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(3200, now);
      bandpass.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      bandpass.Q.setValueAtTime(3.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);

      // 2. High-speed spinning silk whistle (THWIP tone)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.09);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // 3. Elastic tension pull snap (the "KHEENCHNA" spring twang)
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();

      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(260, now + 0.04);
      snapOsc.frequency.exponentialRampToValueAtTime(110, now + 0.16);

      snapGain.gain.setValueAtTime(0.0, now);
      snapGain.gain.setValueAtTime(0.3, now + 0.04);
      snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);

      snapOsc.start(now + 0.04);
      snapOsc.stop(now + 0.16);
    } catch {}
  }
}

export default function WebShooterOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shotsRef = useRef<WebShot[]>([]);
  const nextIdRef = useRef(1);
  const soundFXRef = useRef<SpideySoundFX | null>(null);
  const [shotCount, setShotCount] = useState(0);

  useEffect(() => {
    soundFXRef.current = new SpideySoundFX();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Global click listener to shoot webs and trigger elastic pull!
    const handleClick = (e: MouseEvent) => {
      // Don't trigger on input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const targetX = e.clientX;
      const targetY = e.clientY;

      // Origin: alternate between bottom-left and bottom-right wrists
      const isRightWrist = targetX > width / 2;
      const originX = isRightWrist ? width * 0.85 : width * 0.15;
      const originY = height + 10;

      // Play authentic synthesized THWIP sound
      soundFXRef.current?.playThwip();

      // Elastic recoil vibration on page container
      const mainEl = document.querySelector('main') as HTMLElement | null;
      if (mainEl) {
        const pullDirX = (originX - targetX) * 0.015;
        const pullDirY = (originY - targetY) * 0.012;
        mainEl.style.transition = 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)';
        mainEl.style.transform = `translate3d(${pullDirX.toFixed(1)}px, ${pullDirY.toFixed(1)}px, 0)`;

        setTimeout(() => {
          mainEl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          mainEl.style.transform = 'translate3d(0, 0, 0)';
        }, 80);
      }

      // Generate particles for impact web splat
      const particles: WebShot['particles'] = [];
      const particleCount = 14;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5.5;
        particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 0.4 + Math.random() * 0.3,
          size: 1.5 + Math.random() * 2.5,
          color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#ef4444' : '#38bdf8')
        });
      }

      shotsRef.current.push({
        id: nextIdRef.current++,
        originX,
        originY,
        targetX,
        targetY,
        progress: 0,
        pullPhase: 0,
        alpha: 1.0,
        tensionFreq: 18 + Math.random() * 6,
        tensionAmp: 12 + Math.random() * 8,
        splatRadius: 24 + Math.random() * 10,
        particles
      });

      setShotCount(prev => prev + 1);
    };

    window.addEventListener('pointerdown', handleClick);

    let animId = 0;

    // Draw spiderweb decal at impact target
    const drawWebSplat = (x: number, y: number, radius: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
      ctx.shadowBlur = 6;

      const spokes = 8;
      // Draw radial spokes
      for (let i = 0; i < spokes; i++) {
        const a = (i * Math.PI * 2) / spokes;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
        ctx.stroke();
      }

      // Draw concentric web rings
      const rings = 3;
      for (let r = 1; r <= rings; r++) {
        const rad = (radius / rings) * r;
        ctx.beginPath();
        for (let i = 0; i <= spokes; i++) {
          const a = (i * Math.PI * 2) / spokes;
          const px = x + Math.cos(a) * rad;
          const py = y + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Core white web anchor node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const shots = shotsRef.current;
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];

        // 1. Advance progress (fast shoot in 0.05s)
        if (shot.progress < 1) {
          shot.progress = Math.min(1, shot.progress + 0.16);
        } else {
          // 2. Elastic pull tension phase
          shot.pullPhase += 0.08;
          shot.alpha -= 0.024; // smooth fade out
        }

        if (shot.alpha <= 0) {
          shots.splice(i, 1);
          continue;
        }

        const currentTargetX = shot.originX + (shot.targetX - shot.originX) * shot.progress;
        const currentTargetY = shot.originY + (shot.targetY - shot.originY) * shot.progress;

        // Draw main silk web line
        ctx.save();
        ctx.globalAlpha = shot.alpha;

        const dx = currentTargetX - shot.originX;
        const dy = currentTargetY - shot.originY;
        const dist = Math.hypot(dx, dy);
        const normalX = -dy / (dist || 1);
        const normalY = dx / (dist || 1);

        // Sinusoidal tension wave: vibrating web string as it pulls!
        const vibration = Math.sin(shot.pullPhase * shot.tensionFreq) * shot.tensionAmp * Math.exp(-shot.pullPhase * 2.8);

        ctx.beginPath();
        ctx.moveTo(shot.originX, shot.originY);

        // Curved elastic web strand using quadratic bezier
        const midX = (shot.originX + currentTargetX) * 0.5 + normalX * vibration;
        const midY = (shot.originY + currentTargetY) * 0.5 + normalY * vibration;
        ctx.quadraticCurveTo(midX, midY, currentTargetX, currentTargetY);

        // Outer glowing web halo (electric red & cyan)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Core bright white silk thread
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 2;
        ctx.stroke();

        // 2nd fine braided strand for organic silk texture
        ctx.beginPath();
        const midX2 = (shot.originX + currentTargetX) * 0.5 - normalX * (vibration * 0.5);
        const midY2 = (shot.originY + currentTargetY) * 0.5 - normalY * (vibration * 0.5);
        ctx.quadraticCurveTo(midX2, midY2, currentTargetX, currentTargetY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        ctx.restore();

        // If target reached, draw impact spiderweb splat and update particles
        if (shot.progress >= 0.9) {
          drawWebSplat(shot.targetX, shot.targetY, shot.splatRadius, shot.alpha);

          // Update & draw particles
          ctx.save();
          for (const p of shot.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.life -= 0.035;

            if (p.life > 0) {
              ctx.globalAlpha = p.life * shot.alpha;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 select-none"
      />

      {/* Floating Interactive Spider Web-Shooter Badge Tip */}
      <div className="fixed bottom-4 left-14 z-40 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-red-500/40 shadow-lg shadow-red-500/10 backdrop-blur-md text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-bold">THWIP!</span>
          <span>Click anywhere to shoot web &amp; pull</span>
          {shotCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-red-600/30 text-red-300 text-[10px] font-bold">
              {shotCount}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
