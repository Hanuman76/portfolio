'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { WhatsappIcon, GithubIcon, LinkedinIcon, InstagramIcon } from '@/components/ui/Icons';
import type { Profile } from '@/lib/portfolioStore';

export default function GetInTouchYellowSection({ profile }: { profile: Profile }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const whatsappCleanNumber = profile.whatsapp ? profile.whatsapp.replace(/[^0-9]/g, '') : '919876543210';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
      `Hello ${profile.name}! Name: ${formData.name} (${formData.email}) - Message: ${formData.message}`
    )}`;
    window.open(waUrl, '_blank');
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 4500);
  };

  return (
    <section className="bg-[#def43a] text-slate-900 py-24 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & 4 Social Buttons (Exact from frame_18s.jpg) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Header pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/10 text-xs font-mono font-bold text-slate-900 mb-6">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>GET IN TOUCH</span>
            </div>

            {/* Giant Title from Reel */}
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Let&apos;s build
              </h2>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900/80">
                something cool.
              </h2>
            </div>

            {/* Subtitle from Reel */}
            <p className="mt-5 text-sm sm:text-base text-slate-800 max-w-md font-medium leading-relaxed">
              Whether you have a project idea or just want to chat about web apps and coffee, my inbox is always open.
            </p>

            {/* 4 Square Rounded Social Buttons in a Row (Directly from Reel) */}
            <div className="flex items-center gap-3 mt-8">
              {/* Email */}
              <a
                href={`mailto:${profile.email}`}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-900/20 hover:border-black flex items-center justify-center text-slate-900 shadow-sm hover:scale-110 transition-all"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${whatsappCleanNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white border border-slate-900/20 hover:border-black flex items-center justify-center text-slate-900 shadow-sm hover:scale-110 transition-all"
                title="WhatsApp"
              >
                <WhatsappIcon className="w-5 h-5" />
              </a>

              {/* GitHub */}
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white border border-slate-900/20 hover:border-black flex items-center justify-center text-slate-900 shadow-sm hover:scale-110 transition-all"
                title="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>

              {/* LinkedIn */}
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white border border-slate-900/20 hover:border-black flex items-center justify-center text-slate-900 shadow-sm hover:scale-110 transition-all"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column: White Contact Form Card (Exact from frame_18s.jpg) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-black/10">
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
                  <h3 className="text-xl font-bold text-slate-900">Message Dispatched!</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    WhatsApp chat opened with your details. I will respond to your inquiry shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 mb-2">
                        YOUR NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Vansh / Recruiter"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 mb-2">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 mb-2">
                      THE VIBE / MESSAGE
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Hey Devraj, let's collaborate on..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-black transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-black flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
