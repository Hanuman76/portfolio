'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, Globe, Database, GraduationCap, Award, Calendar, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import type { EducationItem } from '@/lib/portfolioStore';

export default function WhatIBuildSection({ educationList = [] }: { educationList?: EducationItem[] }) {
  const [eduFilter, setEduFilter] = useState('All');

  const services = [
    {
      icon: MessageSquare,
      iconColor: '#f43f5e',
      iconBg: 'bg-rose-50 border-rose-200',
      title: 'Chatbots for Small Businesses',
      description: 'Intelligent website chatbots to handle customer inquiries, capture leads, and automate engagement 24/7.',
      badge: 'Interactive AI',
    },
    {
      icon: Bot,
      iconColor: '#0ea5e9',
      iconBg: 'bg-sky-50 border-sky-200',
      title: 'WhatsApp Automation for Business',
      description: 'Automated WhatsApp interactions to instant message clients, confirm bookings, and drive automated sales alerts.',
      badge: 'Twilio & API',
    },
    {
      icon: Globe,
      iconColor: '#10b981',
      iconBg: 'bg-emerald-50 border-emerald-200',
      title: 'Production-Ready Web Applications',
      description: 'Full-stack platforms built using Python, PHP, Next.js, and React with responsive client interfaces.',
      badge: 'Full Stack',
    },
    {
      icon: Database,
      iconColor: '#8b5cf6',
      iconBg: 'bg-purple-50 border-purple-200',
      title: 'Database & API Architecture',
      description: 'Scalable schema design across MySQL, MongoDB, and PostgreSQL with high-throughput RESTful endpoints.',
      badge: 'Backend Core',
    },
  ];

  const filterOptions = ['All', 'MCA', 'BCA', '12th', '10th', 'Certification'];

  const filteredEducation = educationList.filter((item) => {
    if (eduFilter === 'All') return true;
    return (
      item.level.toLowerCase().includes(eduFilter.toLowerCase()) ||
      item.degree.toLowerCase().includes(eduFilter.toLowerCase())
    );
  });

  return (
    <section id="what-i-do" className="py-24 bg-[#f8fafc] relative z-10 border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading from the Reel */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SOLUTIONS & EXPERTISE</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            What I{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
              Build.
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
            Custom web applications, conversational automation engines, and scalable digital tools engineered for real business outcomes.
          </p>
        </div>

        {/* 4 Cards from the Reel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${item.iconBg}`}>
                      <IconComp className="w-6 h-6" style={{ color: item.iconColor }} />
                    </div>
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-600 group-hover:underline flex items-center gap-1">
                    <span>Explore details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Academic Qualification Section (School, BCA, MCA) */}
        <div id="education" className="mt-24 pt-16 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">
              ACADEMIC BACKGROUND
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
              Education: School, BCA &amp; MCA
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Verified computer science degrees and academic journey from high school foundations to post-graduation.
            </p>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setEduFilter(opt)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                    eduFilter === opt
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:text-emerald-600 border border-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredEducation.map((edu, eIdx) => {
              const isPostGrad = edu.level === 'MCA';
              return (
                <div
                  key={edu.id || eIdx}
                  className={`bg-white rounded-3xl p-6 border transition-all shadow-sm hover:shadow-lg ${
                    isPostGrad ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        isPostGrad ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {edu.level}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{edu.year}</span>
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 leading-snug">
                    {edu.degree}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{edu.institution}</span>
                  </p>

                  <div className="mt-4 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Performance:</span>
                    <span className="font-bold text-emerald-700 font-mono">{edu.score}</span>
                  </div>

                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      {edu.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
