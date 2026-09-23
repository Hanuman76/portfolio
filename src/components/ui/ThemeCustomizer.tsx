'use client';

import React, { useState, useEffect } from 'react';
import { Palette, X, RotateCcw, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
  { name: 'Gen-Z Cyber Red', accent: '#ef4444', bg: '#0b0f19', text: '#f8fafc', glow: 'rgba(239, 68, 68, 0.45)' },
  { name: 'Electric Cyan', accent: '#06b6d4', bg: '#08131f', text: '#f0fdf4', glow: 'rgba(6, 182, 212, 0.45)' },
  { name: 'Neon Emerald', accent: '#10b981', bg: '#071811', text: '#f0fdf4', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Vibrant Violet', accent: '#a855f7', bg: '#100b1a', text: '#faf5ff', glow: 'rgba(168, 85, 247, 0.45)' },
  { name: 'Solar Amber', accent: '#f59e0b', bg: '#140e06', text: '#fffbeb', glow: 'rgba(245, 158, 11, 0.45)' },
];

export default function ThemeCustomizer({ onThemeChange }: { onThemeChange?: (accent: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#ef4444');
  const [bgColor, setBgColor] = useState('#0b0f19');
  const [textColor, setTextColor] = useState('#f8fafc');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Apply colors to CSS custom properties
  const applyTheme = (accent: string, bg: string, text: string, glow?: string) => {
    setAccentColor(accent);
    setBgColor(bg);
    setTextColor(text);

    const root = document.documentElement;
    root.style.setProperty('--accent-color', accent);
    root.style.setProperty('--bg-color', bg);
    root.style.setProperty('--text-color', text);

    const calculatedGlow = glow || `${accent}66`;
    root.style.setProperty('--accent-glow', calculatedGlow);

    if (onThemeChange) {
      onThemeChange(accent);
    }
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    applyTheme(preset.accent, preset.bg, preset.text, preset.glow);
  };

  const handleSaveDefault = async () => {
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accentColor,
          bgColor,
          textColor,
          glowColor: `${accentColor}66`,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to persist theme:', err);
    }
  };

  const resetDefault = () => {
    handlePresetSelect(PRESETS[0]);
  };

  return (
    <>
      {/* Floating Theme Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-medium text-white shadow-2xl border border-white/20 backdrop-blur-xl transition-all"
        style={{
          backgroundColor: 'var(--card-bg)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px var(--accent-glow)',
          borderColor: 'var(--accent-color)',
        }}
        aria-label="Customize Portfolio Theme"
      >
        <Palette className="w-5 h-5 text-accent animate-pulse" />
        <span className="text-sm font-semibold tracking-wide hidden sm:inline">Theme Studio</span>
      </motion.button>

      {/* Floating Modal / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-3xl p-5 shadow-2xl glass-card border border-white/15 backdrop-blur-2xl"
            style={{
              borderColor: 'var(--accent-color)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px var(--accent-glow)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="font-bold text-white text-base">Live Theme Customizer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="group relative flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 hover:border-white/40 transition-all"
                    style={{ backgroundColor: preset.bg }}
                    title={preset.name}
                  >
                    <span
                      className="w-5 h-5 rounded-full block shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.accent }}
                    />
                    {accentColor === preset.accent && (
                      <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Color Pickers */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-white/80 font-medium">Accent Glow Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => applyTheme(e.target.value, bgColor, textColor)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-white/60">{accentColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-white/80 font-medium">Background Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => applyTheme(accentColor, e.target.value, textColor)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-white/60">{bgColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-white/80 font-medium">Typography Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => applyTheme(accentColor, bgColor, e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-white/60">{textColor}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={resetDefault}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <button
                onClick={handleSaveDefault}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-xl text-white transition-all shadow-md"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save as Default</span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
