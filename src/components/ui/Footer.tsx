'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import { WhatsappIcon, GithubIcon, LinkedinIcon, InstagramIcon } from '@/components/ui/Icons';
import type { Profile } from '@/lib/portfolioStore';

export default function Footer({ profile }: { profile: Profile }) {
  const whatsappCleanNumber = profile.whatsapp ? profile.whatsapp.replace(/[^0-9]/g, '') : '919876543210';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0f141c] text-white py-12 px-4 sm:px-6 lg:px-8 relative z-20 border-t border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Subtitle */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="font-black text-lg tracking-tight text-white flex items-center gap-2">
            {profile.name.toUpperCase()}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              MCA
            </span>
          </span>
          <span className="text-xs text-slate-400 font-mono mt-1">
            Full-Stack Web Developer &amp; Systems Architect
          </span>
        </div>

        {/* Social Links Row */}
        <div className="flex items-center gap-3">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappCleanNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all hover:scale-110"
            title="WhatsApp"
          >
            <WhatsappIcon className="w-4 h-4" />
          </a>

          {/* Instagram */}
          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500 flex items-center justify-center text-slate-400 hover:text-pink-400 transition-all hover:scale-110"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>

          {/* GitHub */}
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-white flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110"
            title="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* LinkedIn */}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-400 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all hover:scale-110"
            title="LinkedIn"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>

          {/* Scroll To Top */}
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-all hover:scale-110 ml-2"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Admin Link & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right text-xs text-slate-500 font-mono gap-1.5">
          <Link
            href="/admin"
            className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin Control Panel</span>
          </Link>
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
