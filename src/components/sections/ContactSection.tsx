'use client';

import React, { useState } from 'react';
import { Mail, ArrowUp, Copy, Check } from 'lucide-react';
import { WhatsappIcon, GithubIcon, LinkedinIcon, InstagramIcon } from '@/components/ui/Icons';
import type { Profile } from '@/lib/portfolioStore';

export default function ContactSection({ profile }: { profile: Profile }) {
  const [copied, setCopied] = useState(false);
  const whatsappCleanNumber = profile.whatsapp ? profile.whatsapp.replace(/[^0-9]/g, '') : '919876543210';

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email || 'devraj.mca.dev@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative z-30 text-white bg-[#0e121a]">
      {/* Wave transition from the yellow section above into this dark section */}
      <div className="w-full overflow-hidden leading-none pointer-events-none -mt-1">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-14 sm:h-20 text-[#0e121a] fill-current"
        >
          <path d="M0,0 C200,80 450,110 650,50 C850,-10 1050,70 1200,30 L1200,120 L0,120 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-12 border-b border-slate-800">
          {/* Left Column: Massive "Let's talk Digital." from detail_19s.jpg */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
              Let&apos;s talk
            </h2>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#def43a] to-emerald-400">
              Digital.
            </h2>

            {/* Email link with icon (Directly from Reel) */}
            <div className="mt-6">
              <button
                onClick={copyEmail}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group text-sm sm:text-base font-mono"
                title="Click to copy email address"
              >
                <span className="font-semibold underline underline-offset-4 decoration-slate-600 group-hover:decoration-white">
                  {profile.email || 'devraj.mca.dev@gmail.com'}
                </span>
                <Mail className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                {copied && (
                  <span className="text-xs text-emerald-400 font-mono ml-1 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Social Icons row + Neon Green Scroll-to-Top Button */}
          <div className="lg:col-span-5 flex items-center justify-between lg:justify-end gap-5">
            <div className="flex items-center gap-3">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${whatsappCleanNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all hover:scale-110"
                title="WhatsApp"
              >
                <WhatsappIcon className="w-4 h-4" />
              </a>

              {/* Instagram */}
              <a
                href={profile.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500 flex items-center justify-center text-slate-400 hover:text-pink-400 transition-all hover:scale-110"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              {/* GitHub */}
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-white flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>

              {/* LinkedIn */}
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-400 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all hover:scale-110"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>

            {/* NEON GREEN FLOATING SCROLL-TO-TOP BUTTON (Exact element from Reel) */}
            <button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-[#def43a] hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
              title="Scroll to top"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Bottom copyright from Reel */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-3">
          <p>© {new Date().getFullYear()} {profile.name.toUpperCase()} • BUILT WITH PASSION</p>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">MCA Scholar // Full-Stack</span>
            <span>•</span>
            <a href="/admin" className="hover:text-white transition-colors">
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
