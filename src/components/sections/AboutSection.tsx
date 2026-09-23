'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Calendar, Sparkles, GraduationCap } from 'lucide-react';
import type { Profile, EducationItem } from '@/lib/portfolioStore';

export default function AboutSection({
  profile,
  educationList = [],
}: {
  profile: Profile;
  educationList?: EducationItem[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterOptions = ['All', 'MCA', 'BCA', '12th', '10th', 'Certification'];

  const filteredEducation = educationList.filter((item) => {
    if (selectedFilter === 'All') return true;
    return (
      item.level.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      item.degree.toLowerCase().includes(selectedFilter.toLowerCase())
    );
  });

  return (
    <section id="education" className="py-24 bg-[#f8fafc] relative z-10 border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>ACADEMIC FOUNDATION</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Education: School, BCA &amp; MCA.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
            Verified academic qualifications in Computer Applications and software engineering foundations.
          </p>

          {/* Education Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                  selectedFilter === opt
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:text-emerald-600 border border-slate-200 shadow-sm'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Education Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEducation.map((edu, index) => {
            const isPostGrad = edu.level === 'MCA';
            return (
              <motion.div
                key={edu.id || index}
                whileHover={{ y: -6 }}
                className={`bg-white rounded-3xl p-6 sm:p-7 border h-full flex flex-col justify-between transition-all shadow-sm hover:shadow-xl ${
                  isPostGrad
                    ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        isPostGrad
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {edu.level}
                    </span>

                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{edu.year}</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                    {edu.degree}
                  </h3>

                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{edu.institution}</span>
                  </div>

                  {/* Performance / Grade */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Performance:</span>
                    <span className="font-bold text-emerald-700 font-mono">{edu.score}</span>
                  </div>

                  {/* Curriculum Highlights */}
                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block font-semibold">
                        Curriculum:
                      </span>
                      {edu.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>ACADEMIC RECORD</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
