'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

// Rich celestial & botanical glyph vocabulary
const GLYPH_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'0123456789',
  '✦', '✧', '❀', '✿', '✾', '·', '•', '◊', 'Ξ', 'Ψ', 'Ω', 'Δ', 'Λ', '—', ':', '×', '/', '\\'
];

function getRandomRune() {
  if (Math.random() < 0.08) return ' ';
  const idx = Math.floor(Math.random() * GLYPH_CHARS.length);
  return GLYPH_CHARS[idx];
}

class Point {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  baseX: number;
  baseY: number;
  pinned: boolean;
  char: string;
  opacity: number;

  constructor(x: number, y: number, pinned = false, char = ' ', opacity = 1.0) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.baseX = x;
    this.baseY = y;
    this.pinned = pinned;
    this.char = char;
    this.opacity = opacity;
  }

  update(friction: number, gravity: number, springStiffness: number) {
    if (this.pinned) {
      this.x = this.baseX;
      this.y = this.baseY;
      return;
    }

    const vx = (this.x - this.oldX) * friction;
    const vy = (this.y - this.oldY) * friction;

    this.oldX = this.x;
    this.oldY = this.y;

    this.x += vx;
    this.y += vy + gravity;

    const springX = (this.baseX - this.x) * springStiffness;
    const springY = (this.baseY - this.y) * (springStiffness * 0.85);
    this.x += springX;
    this.y += springY;
  }
}

class DistanceConstraint {
  p1: Point;
  p2: Point;
  length: number;
  stiffness: number;

  constructor(p1: Point, p2: Point, length: number, stiffness: number) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.stiffness = stiffness;
  }

  resolve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return;

    const diff = (this.length - dist) / dist;
    const offsetX = dx * diff * 0.5 * this.stiffness;
    const offsetY = dy * diff * 0.5 * this.stiffness;

    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    } else if (!this.p2.pinned) {
      this.p2.x += offsetX * 2;
      this.p2.y += offsetY * 2;
      return;
    }

    if (!this.p2.pinned) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    } else if (!this.p1.pinned) {
      this.p1.x -= offsetX * 2;
      this.p1.y -= offsetY * 2;
    }
  }
}

// Curtain glide audio manager with gentle fade-in and smooth fade-out
class CurtainAudioController {
  private audio: HTMLAudioElement | null = null;
  private isPrimed = false;
  private fadeRaf: number | null = null;
  private inactivityTimeout: ReturnType<typeof setTimeout> | null = null;
  public isMuted = false;
  private targetVolume = 0;
  private currentVolume = 0;
  public onStateChange?: (isPlaying: boolean) => void;

  constructor(src: string) {
    if (typeof window === 'undefined') return;
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = 0;
    this.audio.preload = 'auto';

    const prime = () => {
      if (this.isPrimed || !this.audio) return;
      this.isPrimed = true;
      this.audio.play().then(() => {
        if (this.targetVolume === 0 && this.audio) {
          this.audio.pause();
        }
      }).catch(() => {});
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('keydown', prime);
    };

    window.addEventListener('pointerdown', prime);
    window.addEventListener('keydown', prime);
  }

  public triggerGlide() {
    if (this.isMuted || !this.audio) return;

    this.targetVolume = 0.75;

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    if (this.audio.paused) {
      this.audio.play().then(() => {
        this.onStateChange?.(true);
      }).catch(() => {});
    }

    this.startFader();

    // Fade down after 850ms of stillness
    this.inactivityTimeout = setTimeout(() => {
      this.fadeDown();
    }, 850);
  }

  public fadeDown() {
    this.targetVolume = 0;
    this.startFader();
  }

  private startFader() {
    if (this.fadeRaf || !this.audio) return;

    const step = () => {
      if (!this.audio) {
        this.fadeRaf = null;
        return;
      }
      const diff = this.targetVolume - this.currentVolume;
      if (Math.abs(diff) < 0.02) {
        this.currentVolume = this.targetVolume;
        this.audio.volume = this.currentVolume;
        if (this.currentVolume === 0 && !this.audio.paused) {
          this.audio.pause();
          this.onStateChange?.(false);
        }
        this.fadeRaf = null;
        return;
      }

      const rate = diff > 0 ? 0.08 : 0.035;
      this.currentVolume += diff * rate;
      this.audio.volume = Math.max(0, Math.min(1, this.currentVolume));
      this.fadeRaf = requestAnimationFrame(step);
    };

    this.fadeRaf = requestAnimationFrame(step);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.audio) {
      this.audio.pause();
      this.currentVolume = 0;
      this.targetVolume = 0;
      this.onStateChange?.(false);
    }
    return this.isMuted;
  }

  public destroy() {
    if (this.inactivityTimeout) clearTimeout(this.inactivityTimeout);
    if (this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}

export default function PillarsCurtain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);
  const audioRef = useRef<CurtainAudioController | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Initialize curtain audio player
    const audioController = new CurtainAudioController('/spiderman-theme.mp3');
    audioController.onStateChange = (playing) => {
      setIsAudioPlaying(playing);
    };
    audioRef.current = audioController;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CONFIG = {
      cols: 24,
      rows: 28,
      fontSize: 7.5,
      curtainWidthFrac: 0.52,
      asymmetry: 5,
      pushStrength: 2.8,
      springStiffness: 0.12,
      friction: 0.91,
      brushRadius: 42,
      gravity: 0.04,
      stiffnessY: 0.98,
      constraintIterations: 3,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    };

    let width = container.clientWidth || 460;
    let height = container.clientHeight || 640;

    let points: Point[] = [];
    let constraints: DistanceConstraint[] = [];

    // Pointer state
    const pointer = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      vx: 0,
      vy: 0,
      active: false
    };

    // Glyph atlas
    let glyphAtlasCanvas: HTMLCanvasElement | null = null;
    const glyphMap = new Map<string, { sx: number; sy: number; sw: number; sh: number; w: number; h: number }>();
    let cellW = 14;
    let cellH = 16;

    function buildGlyphAtlas() {
      cellW = Math.max(Math.round(CONFIG.fontSize * 1.8), 12);
      cellH = Math.max(Math.round(CONFIG.fontSize * 2.0), 14);

      const chars = Array.from(new Set(GLYPH_CHARS.concat([' ', '•', '·', '✦', '✧', '❀', '✿', '✾', '◊', 'Ξ', 'Ψ', 'Ω'])));
      const cols = 16;
      const rows = Math.ceil(chars.length / cols);

      glyphAtlasCanvas = document.createElement('canvas');
      glyphAtlasCanvas.width = cols * cellW * CONFIG.dpr;
      glyphAtlasCanvas.height = rows * cellH * CONFIG.dpr;

      const actx = glyphAtlasCanvas.getContext('2d');
      if (!actx) return;
      actx.scale(CONFIG.dpr, CONFIG.dpr);

      actx.font = `600 ${CONFIG.fontSize}px 'JetBrains Mono', 'Courier New', monospace`;
      actx.textAlign = 'center';
      actx.textBaseline = 'middle';

      chars.forEach((char, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cellX = col * cellW;
        const cellY = row * cellH;
        const centerX = cellX + cellW / 2;
        const centerY = cellY + cellH / 2;

        // Warm champagne and golden glow
        actx.shadowColor = 'rgba(220, 38, 38, 0.85)';
        actx.shadowBlur = 4;
        actx.fillStyle = 'rgba(255, 241, 242, 0.95)';
        actx.fillText(char, centerX, centerY);

        actx.shadowBlur = 0;
        actx.fillStyle = '#fffaf0';
        actx.fillText(char, centerX, centerY);

        glyphMap.set(char, {
          sx: cellX * CONFIG.dpr,
          sy: cellY * CONFIG.dpr,
          sw: cellW * CONFIG.dpr,
          sh: cellH * CONFIG.dpr,
          w: cellW,
          h: cellH
        });
      });
    }

    function initSimulation() {
      points = [];
      constraints = [];

      const naturalRatio = 696 / 1024;
      const boxRatio = width / height;

      let renderedW: number, renderedH: number, renderedLeft: number, renderedTop: number;
      if (boxRatio > naturalRatio) {
        renderedH = height;
        renderedW = renderedH * naturalRatio;
        renderedLeft = (width - renderedW) / 2;
        renderedTop = 0;
      } else {
        renderedW = width;
        renderedH = renderedW / naturalRatio;
        renderedLeft = 0;
        renderedTop = height - renderedH;
      }

      const centerX = renderedLeft + renderedW * 0.535;
      const curtainWidth = renderedW * CONFIG.curtainWidthFrac;
      const minX = centerX - curtainWidth / 2;
      const maxX = centerX + curtainWidth / 2;

      const baseTopApexY = renderedTop + renderedH * 0.178;
      const baseBotY = renderedTop + renderedH * 0.93;

      for (let c = 0; c < CONFIG.cols; c++) {
        const u = (c / (CONFIG.cols - 1) - 0.5) * 2;
        const baseX = minX + (c / (CONFIG.cols - 1)) * (maxX - minX);

        // Curved architrave dome ring curve
        const domeCurve = Math.pow(Math.abs(u), 1.9) * (renderedH * 0.076);
        const bottomJitter = (Math.sin(c * 2.37) * 5 + Math.cos(c * 4.19) * 4) * (CONFIG.asymmetry / 6);
        const topJitter = (Math.sin(c * 3.1) * 1.2) * (CONFIG.asymmetry / 6);

        const topY = baseTopApexY + domeCurve + topJitter;
        const botY = baseBotY + bottomJitter;
        const threadHeight = Math.max(botY - topY, 40);
        const spacingY = threadHeight / (CONFIG.rows - 1);

        for (let r = 0; r < CONFIG.rows; r++) {
          const baseY = topY + r * spacingY;
          const isPinned = (r === 0);
          const char = getRandomRune();
          const opacity = 0.72 + Math.random() * 0.28;

          points.push(new Point(baseX, baseY, isPinned, char, opacity));
        }
      }

      // Vertical distance constraints
      for (let c = 0; c < CONFIG.cols; c++) {
        for (let r = 0; r < CONFIG.rows - 1; r++) {
          const currIdx = c * CONFIG.rows + r;
          const nextIdx = c * CONFIG.rows + (r + 1);
          const p1 = points[currIdx];
          const p2 = points[nextIdx];
          const initialDist = Math.hypot(p2.baseX - p1.baseX, p2.baseY - p1.baseY);
          constraints.push(new DistanceConstraint(p1, p2, initialDist, CONFIG.stiffnessY));
        }
      }
    }

    function resize() {
      if (!container || !canvas) return;
      width = container.clientWidth || 460;
      height = container.clientHeight || 640;

      canvas.width = Math.round(width * CONFIG.dpr);
      canvas.height = Math.round(height * CONFIG.dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(CONFIG.dpr, CONFIG.dpr);

      buildGlyphAtlas();
      initSimulation();
    }

    function applyBrushGlide() {
      if (!pointer.active) return;
      const brushR = CONFIG.brushRadius;
      const brushRSq = brushR * brushR;
      const pVx = pointer.vx;
      const pVy = pointer.vy;

      let touchedCurtain = false;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.pinned) continue;

        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < brushRSq) {
          touchedCurtain = true;
          const d = Math.sqrt(dSq);
          const factor = (1 - d / brushR);
          const signX = dx >= 0 ? 1 : -1;

          p.x += signX * factor * CONFIG.pushStrength;
          p.y += (dy / (d || 1)) * factor * (CONFIG.pushStrength * 0.4);

          p.oldX -= pVx * factor * 0.12;
          p.oldY -= pVy * factor * 0.12;
        }
      }

      // Check if mouse moved near or through curtain zone
      const naturalRatio = 696 / 1024;
      const renderedH = height;
      const renderedW = renderedH * naturalRatio;
      const renderedLeft = (width - renderedW) / 2;
      const centerX = renderedLeft + renderedW * 0.535;
      const curtainWidth = renderedW * CONFIG.curtainWidthFrac;
      const minX = centerX - curtainWidth / 2 - 20;
      const maxX = centerX + curtainWidth / 2 + 20;
      const minY = renderedH * 0.16;
      const maxY = renderedH * 0.95;

      const inZone = (pointer.x >= minX && pointer.x <= maxX && pointer.y >= minY && pointer.y <= maxY);

      if (touchedCurtain || (inZone && (Math.abs(pVx) > 0.1 || Math.abs(pVy) > 0.1))) {
        audioRef.current?.triggerGlide();
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      pointer.prevX = pointer.x === -9999 ? clientX : pointer.x;
      pointer.prevY = pointer.y === -9999 ? clientY : pointer.y;
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.vx = (pointer.x - pointer.prevX) * 0.75;
      pointer.vy = (pointer.y - pointer.prevY) * 0.75;
      pointer.active = true;

      applyBrushGlide();
    }

    function handleTouchMove(e: TouchEvent) {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;

      pointer.prevX = pointer.x === -9999 ? clientX : pointer.x;
      pointer.prevY = pointer.y === -9999 ? clientY : pointer.y;
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.vx = (pointer.x - pointer.prevX) * 0.75;
      pointer.vy = (pointer.y - pointer.prevY) * 0.75;
      pointer.active = true;

      applyBrushGlide();
    }

    function handlePointerLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('resize', resize);

    resize();

    // Main animation loop
    function animate() {
      pointer.vx *= 0.75;
      pointer.vy *= 0.75;

      // Step physics
      for (let i = 0; i < points.length; i++) {
        points[i].update(CONFIG.friction, CONFIG.gravity, CONFIG.springStiffness);
      }
      for (let iter = 0; iter < CONFIG.constraintIterations; iter++) {
        for (let i = 0; i < constraints.length; i++) {
          constraints[i].resolve();
        }
      }

      // Render
      ctx.clearRect(0, 0, width, height);

      if (glyphAtlasCanvas && points.length > 0) {
        ctx.save();

        // Delicate hanging thread lines
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.28)';
        for (let c = 0; c < CONFIG.cols; c++) {
          ctx.beginPath();
          const colStart = c * CONFIG.rows;
          ctx.moveTo(points[colStart].x, points[colStart].y);
          for (let r = 1; r < CONFIG.rows; r++) {
            const pt = points[colStart + r];
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }

        // Living runes
        const halfW = cellW / 2;
        const halfH = cellH / 2;

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (p.char === ' ') continue;

          const glyph = glyphMap.get(p.char);
          if (glyph) {
            ctx.globalAlpha = p.opacity;
            ctx.drawImage(
              glyphAtlasCanvas,
              glyph.sx, glyph.sy, glyph.sw, glyph.sh,
              Math.round(p.x - halfW), Math.round(p.y - halfH), glyph.w, glyph.h
            );
          }
        }

        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(animate);
    }

    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
      audioController.destroy();
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const muted = audioRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-[340px] sm:w-[420px] lg:w-[440px] h-[480px] sm:h-[560px] lg:h-[580px] z-10 select-none flex items-center justify-center mx-auto"
      style={{ willChange: 'transform' }}
    >
      {/* Interactive Verlet Hanging Cloth Curtain Canvas (Layer 0) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Classical Floral Marble Rotunda Pillars (Layer 1) */}
      <img
        src="/pillars.png"
        alt="Floral marble pillars arch"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xl"
        draggable={false}
      />

      {/* Floating Audio Status Pill in the pillars footer */}
      <div className="absolute -bottom-8 right-2 pointer-events-auto z-30">
        <button
          onClick={handleToggleMute}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white border border-red-200/80 shadow-sm text-[10px] font-mono text-slate-600 hover:text-red-600 transition-all hover:scale-105 backdrop-blur-sm cursor-pointer"
          title={isMuted ? 'Unmute curtain glide music' : 'Mute curtain glide music'}
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-slate-400" />
          ) : (
            <Volume2 className={`w-3 h-3 ${isAudioPlaying ? 'text-red-600 animate-pulse' : 'text-slate-500'}`} />
          )}
          <span>{isMuted ? '🕷️ Spidey Audio: Off' : (isAudioPlaying ? '🕷️ Spider-Man Theme: Playing' : '🕷️ Spider-Man Theme')}</span>
          {isAudioPlaying && !isMuted && (
            <span className="flex gap-0.5 items-center">
              <span className="w-0.5 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
