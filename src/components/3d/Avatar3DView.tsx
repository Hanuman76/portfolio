'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile,
  Zap,
  Footprints,
  Swords,
  Sparkles,
  MessageCircle,
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Flame,
} from 'lucide-react';

interface Avatar3DViewProps {
  avatarUrl?: string;
  name?: string;
}

export type AnimationMode = 'idle' | 'smile' | 'walk' | 'fight' | 'laugh';

export default function Avatar3DView({
  avatarUrl = '/avatar_3d_cutout.png',
  name = 'Devraj',
}: Avatar3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mode, setMode] = useState<AnimationMode>('idle');
  const [isHovered, setIsHovered] = useState(false);
  const [scrollSection, setScrollSection] = useState<'Hero' | 'About' | 'Skills' | 'Projects' | 'Contact'>('Hero');
  const [laughEmojis, setLaughEmojis] = useState<{ id: number; x: number; char: string }[]>([]);

  // Track window scroll to automatically adjust stance & task
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? scrollY / total : 0;

      if (progress < 0.18) {
        setScrollSection('Hero');
        if (!isHovered) setMode('idle');
      } else if (progress < 0.42) {
        setScrollSection('About');
        if (!isHovered) setMode('smile');
      } else if (progress < 0.68) {
        setScrollSection('Skills');
        if (!isHovered) setMode('fight'); // Fight Mode for coding competencies!
      } else if (progress < 0.88) {
        setScrollSection('Projects');
        if (!isHovered) setMode('walk'); // Walking through project deliverables
      } else {
        setScrollSection('Contact');
        if (!isHovered) setMode('smile');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHovered]);

  // Mouse tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isSpinning) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setRotateX(-(y / (rect.height / 2)) * 16);
    setRotateY((x / (rect.width / 2)) * 16);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Hover triggers Laughing animation & floating laughing emojis
  const handleMouseEnter = () => {
    setIsHovered(true);
    setMode('laugh');

    // Spawn laughing emojis burst
    const emojis = ['😂', '😄', '🔥', '⚡', '🚀', '✨'];
    const newItems = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 160,
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setLaughEmojis(newItems);
    setTimeout(() => setLaughEmojis([]), 2500);
  };

  const triggerSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1200);
  };

  // Action status labels
  const statusDescriptions: Record<AnimationMode, { title: string; subtitle: string; icon: any }> = {
    idle: {
      title: 'ONLINE // IDLE TRACKING',
      subtitle: 'Tracking cursor and welcoming visitor.',
      icon: Eye,
    },
    smile: {
      title: 'SMILE // WELCOMING MODE',
      subtitle: 'Warm smile, friendly nod & greetings.',
      icon: Smile,
    },
    walk: {
      title: 'WALK // STRIDING FORWARD',
      subtitle: 'Navigating through project architectures.',
      icon: Footprints,
    },
    fight: {
      title: 'FIGHT MODE // COMBAT STANCE',
      subtitle: 'Combat ready! Crushing bugs & optimizing queries.',
      icon: Swords,
    },
    laugh: {
      title: 'LAUGHING // HOVER ACTIVATED',
      subtitle: 'Hahaha! Having fun exploring my portfolio? 😄',
      icon: Sparkles,
    },
  };

  // Dynamic animations depending on active mode
  const getMotionTarget = () => {
    if (mode === 'laugh') {
      return {
        y: [0, -14, 0, -10, 0, -6, 0],
        rotate: [0, -2, 2, -2, 2, 0],
        scale: [scale * 1.05, scale * 1.1, scale * 1.05],
      };
    }
    if (mode === 'fight') {
      return {
        x: [0, -8, 8, -4, 4, 0],
        y: [0, -6, 0, -4, 0],
        rotate: [0, -3, 3, 0],
        scale: scale * 1.06,
      };
    }
    if (mode === 'walk') {
      return {
        y: [0, -16, 0],
        x: [-6, 6, -6],
        rotate: [-1.5, 1.5, -1.5],
        scale: scale,
      };
    }
    if (mode === 'smile') {
      return {
        y: [0, -8, 0],
        rotate: [0, 1.5, 0],
        scale: scale * 1.04,
      };
    }
    // Default Idle
    return {
      y: [0, -12, 0],
      rotate: [0, 0.5, 0],
      scale: scale,
    };
  };

  const getMotionTransition = () => {
    if (mode === 'laugh') {
      return { duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const };
    }
    if (mode === 'fight') {
      return { duration: 0.9, repeat: Infinity, repeatType: 'mirror' as const };
    }
    if (mode === 'walk') {
      return { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const };
    }
    if (mode === 'smile') {
      return { duration: 2, repeat: Infinity, ease: 'easeInOut' as const };
    }
    return { duration: 3, repeat: Infinity, ease: 'easeInOut' as const };
  };

  const CurrentIcon = statusDescriptions[mode].icon;

  return (
    <div className="relative flex flex-col items-center select-none z-20">
      {/* Speech Bubble when Laughing or Hovered */}
      <AnimatePresence>
        {mode === 'laugh' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.85 }}
            className="absolute -top-16 z-30 glass-card px-4 py-2 rounded-2xl border-2 border-red-500 shadow-xl text-center pointer-events-none"
            style={{
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">😂</span>
              <span className="text-xs font-bold text-white tracking-wide">
                Hahaha! Hey there! Let&apos;s build something insane! 🚀
              </span>
            </div>
            <div className="w-3 h-3 bg-red-500 rotate-45 mx-auto -mb-3.5 mt-1 border-r border-b border-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Burst of Laughing Emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {laughEmojis.map((item) => (
          <motion.span
            key={item.id}
            initial={{ opacity: 1, y: 100, x: item.x, scale: 0.6 }}
            animate={{ opacity: 0, y: -120, x: item.x * 1.5, scale: 1.6 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/3 text-2xl"
          >
            {item.char}
          </motion.span>
        ))}
      </div>

      {/* 3D Character Container (Transparent PNG without square box!) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group cursor-pointer"
        style={{ perspective: 1200 }}
      >
        {/* Holographic Glowing Base Pedestal below feet */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-16 rounded-full pointer-events-none">
          <div
            className="w-full h-full rounded-full blur-xl opacity-60 animate-pulse transition-all"
            style={{
              backgroundColor: mode === 'fight' ? '#ef4444' : 'var(--accent-color)',
              boxShadow: '0 0 50px var(--accent-glow)',
            }}
          />
          {/* Cyber Ring */}
          <div
            className="absolute inset-0 border-2 rounded-full opacity-70 animate-spin"
            style={{
              borderColor: 'var(--accent-color)',
              borderStyle: 'dashed',
              animationDuration: '16s',
            }}
          />
        </div>

        {/* Character Motion Wrapper */}
        <motion.div
          animate={{
            rotateX: isSpinning ? 0 : rotateX,
            rotateY: isSpinning ? [0, 360] : rotateY,
            ...getMotionTarget(),
          }}
          transition={{
            rotateX: { type: 'spring', damping: 20, stiffness: 150 },
            rotateY: { type: isSpinning ? 'tween' : 'spring', damping: 20, stiffness: 150, duration: 1.2 },
            ...getMotionTransition(),
          }}
          className="relative w-[300px] sm:w-[360px] md:w-[420px] h-[400px] sm:h-[480px] md:h-[520px] flex items-center justify-center drop-shadow-2xl"
        >
          {/* Energy Sparks for Fight Mode */}
          {mode === 'fight' && (
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.03, 0.98] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-red-500/60 pointer-events-none blur-sm"
              style={{
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.8), inset 0 0 30px rgba(239, 68, 68, 0.5)',
              }}
            />
          )}

          {/* Transparent PNG Cutout */}
          <Image
            src={avatarUrl}
            alt={`${name} 3D Avatar Cutout`}
            fill
            priority
            className="object-contain object-bottom filter transition-all duration-300"
            style={{
              filter:
                mode === 'fight'
                  ? 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.8))'
                  : 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 20px var(--accent-glow))',
            }}
          />

          {/* Interactive Floating Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 inset-x-6 glass-card px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-xl flex items-center justify-between shadow-2xl"
            style={{ borderColor: mode === 'fight' ? '#ef4444' : 'var(--accent-color)' }}
          >
            <div className="flex items-center gap-2">
              <CurrentIcon className="w-4 h-4 text-accent animate-bounce" />
              <div>
                <span className="text-[11px] font-mono font-bold text-white block">
                  {statusDescriptions[mode].title}
                </span>
                <span className="text-[10px] text-white/60 block truncate max-w-[190px]">
                  {statusDescriptions[mode].subtitle}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10">
              {scrollSection}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Manual Action Switcher Dock (Auto & Clickable) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-2 glass-card px-4 py-2.5 rounded-2xl border border-white/15 shadow-xl text-xs z-30"
      >
        <button
          onClick={() => setMode('smile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
            mode === 'smile'
              ? 'bg-accent text-white shadow-md glow-accent'
              : 'bg-white/5 hover:bg-white/15 text-white/80'
          }`}
          title="Smile & Greet"
        >
          <Smile className="w-3.5 h-3.5" />
          <span>Smile</span>
        </button>

        <button
          onClick={() => setMode('walk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
            mode === 'walk'
              ? 'bg-accent text-white shadow-md glow-accent'
              : 'bg-white/5 hover:bg-white/15 text-white/80'
          }`}
          title="Walk Stride"
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Walk</span>
        </button>

        <button
          onClick={() => setMode('fight')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            mode === 'fight'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 scale-105'
              : 'bg-white/5 hover:bg-white/15 text-white/80'
          }`}
          title="Fight & Combat Mode"
        >
          <Swords className="w-3.5 h-3.5 text-yellow-300" />
          <span>Fight Action</span>
        </button>

        <button
          onClick={() => {
            setMode('laugh');
            handleMouseEnter();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
            mode === 'laugh'
              ? 'bg-accent text-white shadow-md glow-accent'
              : 'bg-white/5 hover:bg-white/15 text-white/80'
          }`}
          title="Laughing Reaction"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Laughing</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          onClick={triggerSpin}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all"
          title="Spin 360 Degrees"
        >
          <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        <button
          onClick={() => setScale((s) => Math.min(s + 0.1, 1.25))}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
        </button>

        <button
          onClick={() => setScale((s) => Math.max(s - 0.1, 0.85))}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 text-yellow-400" />
        </button>

        <button
          onClick={() => {
            setScale(1);
            setRotateX(0);
            setRotateY(0);
            setMode('idle');
          }}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white text-[10px] font-mono"
        >
          Reset
        </button>
      </motion.div>

      <p className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
        <span>Hover mouse on avatar for <strong>Laughing effect</strong> or scroll page to see live actions!</span>
      </p>
    </div>
  );
}
