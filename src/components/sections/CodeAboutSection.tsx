'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import type { Profile } from '@/lib/portfolioStore';

export default function CodeAboutSection({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="py-24 bg-white relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: The Dark Code Editor Card (Exact from Reel) */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-green-500/10 to-transparent shadow-2xl"
            >
              <div className="bg-[#12161f] text-slate-200 rounded-[22px] p-5 sm:p-6 font-mono text-xs sm:text-[13px] border border-slate-800 shadow-inner">
                {/* Mac window traffic light dots */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">devraj.config.ts</span>
                </div>

                {/* Code Block with Syntax Highlighting */}
                <div className="space-y-1.5 leading-relaxed overflow-x-auto text-[12px] sm:text-[13px]">
                  <div>
                    <span className="text-[#ff7b72]">import</span>{' '}
                    <span className="text-[#79c0ff]">{`{ Life, Code }`}</span>{' '}
                    <span className="text-[#ff7b72]">from</span>{' '}
                    <span className="text-[#a5d6ff]">&apos;passion&apos;</span>;
                  </div>
                  <div className="h-2" />
                  <div>
                    <span className="text-[#ff7b72]">const</span>{' '}
                    <span className="text-[#d2a8ff]">{profile.name.replace(/\s+/g, '') || 'Devraj'}</span>{' '}
                    <span className="text-[#ff7b72]">=</span>{' '}
                    <span className="text-[#79c0ff]">()</span>{' '}
                    <span className="text-[#ff7b72]">=&gt;</span>{' '}
                    <span className="text-[#79c0ff]">{`{`}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7ee787]">status:</span>{' '}
                    <span className="text-[#a5d6ff]">&apos;{profile.codeStatus ?? 'Building & Learning'}&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7ee787]">role:</span>{' '}
                    <span className="text-[#a5d6ff]">&apos;{profile.codeRole ?? 'MCA Scholar // Full-Stack'}&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7ee787]">stack:</span>{' '}
                    <span className="text-[#79c0ff]">[</span>
                    <span className="text-[#a5d6ff]">&apos;Python&apos;</span>,{' '}
                    <span className="text-[#a5d6ff]">&apos;PHP&apos;</span>,{' '}
                    <span className="text-[#a5d6ff]">&apos;Next.js&apos;</span>
                    <span className="text-[#79c0ff]">]</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7ee787]">vibe:</span>{' '}
                    <span className="text-[#a5d6ff]">&apos;{profile.codeVibe ?? 'Clean code & Chai'}&apos;</span>,
                  </div>
                  <div className="pl-4 text-slate-500 italic">
                    // Building digital playgrounds...
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7ee787]">mood:</span>{' '}
                    <span className="text-[#79c0ff]">Math.random() &gt; 0.5</span>{' '}
                    <span className="text-[#ff7b72]">?</span>{' '}
                    <span className="text-[#a5d6ff]">&apos;🚀&apos;</span>{' '}
                    <span className="text-[#ff7b72]">:</span>{' '}
                    <span className="text-[#a5d6ff]">&apos;☕&apos;</span>
                  </div>
                  <div>
                    <span className="text-[#79c0ff]">{`};`}</span>
                  </div>
                </div>

                {/* Now Playing Footer Bar (Exact from Reel) */}
                <div className="mt-6 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                    <span className="truncate max-w-[240px]">
                      Now Playing:{' '}
                      <span className="text-slate-300">
                        {profile.nowPlaying ?? 'Lofi Hip Hop Radio - Beats to relax/study to'}
                      </span>
                    </span>
                  </div>
                  {/* Equalizer animation */}
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-emerald-400 animate-pulse" />
                    <span className="w-0.5 h-3 bg-emerald-400 animate-ping" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: "Turning imagination into interactive reality." (Exact from Reel) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-1"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {profile.storyHeading ? (
                  <span className="whitespace-pre-line">{profile.storyHeading}</span>
                ) : (
                  <>
                    Turning{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600">
                      imagination
                    </span>
                    <br />
                    into
                    <br />
                    interactive reality.
                  </>
                )}
              </h2>
            </motion.div>

            {/* Paragraphs from the Reel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal"
            >
              {profile.storyP1 && (
                <p>{profile.storyP1}</p>
              )}
              {profile.storyP2 && (
                <p>{profile.storyP2}</p>
              )}
              {profile.storyP3 && (
                <p className="text-xs sm:text-sm text-slate-500 font-mono pt-1">
                  {profile.storyP3}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
