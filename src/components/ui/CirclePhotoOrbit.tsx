'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import InteractiveFaceCanvas from '@/components/ui/InteractiveFaceCanvas';
import { motion } from 'framer-motion';
import { Phone, Sparkles, Orbit } from 'lucide-react';
import { WhatsappIcon, InstagramIcon, LinkedinIcon } from '@/components/ui/Icons';
import type { Profile } from '@/lib/portfolioStore';

interface CirclePhotoOrbitProps {
  profile: Profile;
}

export default function CirclePhotoOrbit({ profile }: CirclePhotoOrbitProps) {
  const [isPaused, setIsPaused] = useState(false);
  const whatsappCleanNumber = profile.whatsapp ? profile.whatsapp.replace(/[^0-9]/g, '') : '919876543210';
  const photoUrl = profile.avatar || '/my_photo.jpg';

  const satellites = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      subtitle: 'Instant Chat',
      icon: WhatsappIcon,
      href: `https://wa.me/${whatsappCleanNumber}`,
      bgColor: '#25D366',
      glow: 'rgba(37, 211, 102, 0.4)',
      angle: 0, // Top
    },
    {
      id: 'instagram',
      name: 'Instagram',
      subtitle: 'Follow / DM',
      icon: InstagramIcon,
      href: profile.instagram || 'https://instagram.com',
      bgColor: '#E1306C',
      glow: 'rgba(225, 48, 108, 0.4)',
      angle: 90, // Right
    },
    {
      id: 'phone',
      name: 'Phone Call',
      subtitle: profile.phone || '+91 98765 43210',
      icon: Phone,
      href: `tel:${profile.phone || '+919876543210'}`,
      bgColor: '#ea580c',
      glow: 'rgba(234, 88, 12, 0.4)',
      angle: 180, // Bottom
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      subtitle: 'Professional',
      icon: LinkedinIcon,
      href: profile.linkedin || 'https://linkedin.com',
      bgColor: '#0077B5',
      glow: 'rgba(0, 119, 181, 0.4)',
      angle: 270, // Left
    },
  ];

  return (
    <div className="relative flex items-center justify-center select-none py-10 w-full max-w-[480px] h-[480px]">
      {/* Outer Dotted Orbital Ring Track */}
      <div
        className="absolute w-[380px] sm:w-[430px] h-[380px] sm:h-[430px] rounded-full border-2 border-dashed border-orange-300 pointer-events-none opacity-80"
        style={{
          boxShadow: 'inset 0 0 40px rgba(254, 215, 170, 0.3)',
        }}
      />

      {/* Decorative Inner Accent Rings */}
      <div className="absolute w-[330px] sm:w-[370px] h-[330px] sm:h-[370px] rounded-full border border-orange-200/70 pointer-events-none" />

      {/* Central Circular Profile Photo */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        {/* Glowing Orange Back-Aura */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-70 pointer-events-none"
          style={{
            backgroundColor: '#f97316',
            transform: 'scale(1.08)',
          }}
        />

        {/* Circular Avatar Frame */}
        <div
          className="relative w-64 sm:w-72 h-64 sm:h-72 rounded-full p-2.5 shadow-2xl transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 45%, #ffedd5 100%)',
            boxShadow: '0 20px 45px rgba(234, 88, 12, 0.35)',
          }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-inner bg-slate-900">
            <InteractiveFaceCanvas />
          </div>

          {/* Active Verified Badge */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white px-3.5 py-1 rounded-full shadow-lg border border-orange-200 flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-mono tracking-wide text-orange-600 font-extrabold uppercase">
              MCA Scholar
            </span>
          </div>
        </div>
      </motion.div>

      {/* CONTINUOUS MOVING / ORBITING SATELLITE BADGES */}
      <motion.div
        animate={{ rotate: isPaused ? 0 : 360 }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: 'linear',
        }}
        className="absolute w-[380px] sm:w-[430px] h-[380px] sm:h-[430px] rounded-full pointer-events-none z-20"
      >
        {satellites.map((sat) => {
          const IconComponent = sat.icon;
          // Calculate radius position based on angle
          const rad = (sat.angle * Math.PI) / 180;
          // Radius in px (half of container width)
          const radius = 190;
          const leftPercent = 50 + (radius / 215) * 50 * Math.cos(rad);
          const topPercent = 50 + (radius / 215) * 50 * Math.sin(rad);

          return (
            <div
              key={sat.id}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Counter-rotate badge so text & icon always stay upright! */}
              <motion.div
                animate={{ rotate: isPaused ? 0 : -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 22,
                  ease: 'linear',
                }}
              >
                <a
                  href={sat.href}
                  target={sat.id === 'phone' ? '_self' : '_blank'}
                  rel="noreferrer"
                  className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border-2 border-orange-200 shadow-xl hover:scale-115 hover:border-orange-500 hover:shadow-2xl transition-all"
                  style={{
                    boxShadow: `0 8px 25px -4px ${sat.glow}, 0 4px 10px rgba(0,0,0,0.06)`,
                  }}
                  title={`${sat.name}: ${sat.subtitle} (Click to open)`}
                >
                  {/* Icon Circle */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: sat.bgColor }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Text Badge */}
                  <div className="text-left pr-1">
                    <span className="text-xs font-extrabold text-slate-900 block group-hover:text-orange-600 transition-colors leading-tight">
                      {sat.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">
                      {sat.subtitle}
                    </span>
                  </div>
                </a>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Orbit Status Tip below */}
      <div className="absolute -bottom-4 flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-orange-50/80 px-3 py-1 rounded-full border border-orange-200">
        <Orbit className="w-3.5 h-3.5 text-orange-600 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Orbiting Channels // Hover to pause & click</span>
      </div>
    </div>
  );
}
