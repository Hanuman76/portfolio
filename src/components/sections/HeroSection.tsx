'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CirclePhotoOrbit from '@/components/ui/CirclePhotoOrbit';
import { Code2, ChevronDown, GraduationCap } from 'lucide-react';
import type { Profile } from '@/lib/portfolioStore';

export default function HeroSection({ profile }: { profile: Profile }) {
  const whatsappCleanNumber = profile.whatsapp ? profile.whatsapp.replace(/[^0-9]/g, '') : '919876543210';

  return (
    <section id="about" className="relative min-h-[92vh] pt-32 pb-16 flex flex-col justify-between items-center bg-[#fdfdfd] overflow-hidden">
      {/* Subtle light background dot/grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Status Pill (Directly from Reel) */}
            {profile.statusBadge && (
              <motion.a
                href={`https://wa.me/${whatsappCleanNumber}`}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors mb-6 group cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{profile.statusBadge}</span>
                <span className="group-hover:translate-x-0.5 transition-transform text-emerald-600">→</span>
              </motion.a>
            )}

            {/* Giant Headline from the Reel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-1"
            >
              {profile.heroGreeting && (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  {profile.heroGreeting}
                </h1>
              )}
              {profile.name && (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600">
                  {profile.name}
                </h1>
              )}
              {profile.title && (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  {profile.title}
                </h1>
              )}
            </motion.div>

            {/* Subtitle from the Reel */}
            {profile.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-base sm:text-lg text-slate-600 font-normal max-w-lg leading-relaxed"
              >
                {profile.tagline}
              </motion.p>
            )}

            {/* Two Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              {/* Green Pill: </> View My Work */}
              <a
                href="#projects"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-emerald-500/25 transition-all hover:scale-105"
              >
                <Code2 className="w-4 h-4" />
                <span>View My Work</span>
              </a>

              {/* White/Gray Pill: Education & Qualifications */}
              <a
                href="#education"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-all hover:scale-105"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Qualifications (MCA &amp; BCA)</span>
              </a>
            </motion.div>

            {/* Tech Badges Row from the Reel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex items-center gap-3 text-xs text-slate-500 font-mono"
            >
              <div className="flex -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  N
                </span>
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  R
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  Py
                </span>
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  PHP
                </span>
              </div>
              <span className="font-sans text-slate-600 font-medium">
                {profile.techBadgeText || 'Building production-ready web apps'}
              </span>
            </motion.div>
          </div>

          {/* Right Column: User's Circular Photo with Orbiting WhatsApp, Instagram, LinkedIn, Phone Badges */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <CirclePhotoOrbit profile={profile} />
          </div>
        </div>
      </div>

      {/* Scroll indicator from the Reel */}
      <div className="w-full flex flex-col items-center justify-center text-slate-400 text-[11px] font-mono gap-1 pt-6 pb-2 pointer-events-none">
        <span>Scroll to explore</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-slate-400" />
      </div>
    </section>
  );
}
