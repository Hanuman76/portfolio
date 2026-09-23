'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck } from 'lucide-react';
import type { Profile } from '@/lib/portfolioStore';

export default function Navbar({ profile }: { profile?: Profile }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Education', href: '#education' },
    { name: 'Tech', href: '#tech' },
    { name: 'Projects', href: '#projects' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-center py-4 px-4 sm:px-6 pointer-events-none transition-all duration-300">
      <div
        className={`pointer-events-auto flex items-center justify-between w-full max-w-4xl rounded-full px-5 py-2 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 shadow-lg border border-slate-200/80 backdrop-blur-xl'
            : 'bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-md'
        }`}
      >
        {/* Left: Avatar with green ring + Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-emerald-500 ring-offset-2 ring-offset-white shadow-sm">
            <Image
              src={profile?.avatar || '/my_photo.jpg'}
              alt={profile?.name || 'Profile Avatar'}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
            {profile?.name || 'Devraj Ancheriya'}
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              MCA
            </span>
          </span>
        </Link>

        {/* Middle: Links (About, Education, Tech, Projects) */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Available Status Badge & Admin Portal Button */}
        <div className="flex items-center gap-2.5">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Available</span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#1e232a] hover:bg-black text-white shadow-sm transition-all hover:scale-105"
            title="Open Admin Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full md:hidden ml-1"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-slate-200 flex flex-col gap-3 md:hidden z-50"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-800 hover:text-emerald-600 py-1.5 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Login</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
