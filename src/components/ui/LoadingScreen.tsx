'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
          }, 400);
          return 100;
        }
        const diff = Math.floor(Math.random() * 18) + 8;
        return Math.min(100, prev + diff);
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d1117] text-white select-none"
        >
          <div className="flex flex-col items-center text-center px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-1 mb-8"
            >
              <h1 className="text-3xl sm:text-5xl font-black tracking-wider uppercase text-white font-mono">
                DEVRAJ
              </h1>
              <h2 className="text-2xl sm:text-4xl font-black tracking-wider uppercase text-emerald-400 font-mono">
                ANCHERIYA
              </h2>
            </motion.div>

            {/* Cyber Terminal Progress */}
            <div className="w-64 sm:w-80">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-2">
                <span className="tracking-widest uppercase">INITIALIZING CORE</span>
                <span className="text-emerald-400 font-bold">{progress}% / 100</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-400"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 text-[10px] font-mono text-slate-600 text-center tracking-widest">
                SYSTEM_OK // READY
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
