'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedHeading, FadeInOnScroll } from '@/components/animations/AnimatedText';
import { Sparkles, Code2, Database, Layout, Server, Cpu, Terminal, Layers } from 'lucide-react';
import type { Skill } from '@/lib/portfolioStore';

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps & Tools'];

  const filteredSkills =
    selectedCategory === 'All'
      ? skills
      : skills.filter((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend':
        return <Layout className="w-4 h-4 text-orange-500" />;
      case 'backend':
        return <Server className="w-4 h-4 text-amber-500" />;
      case 'database':
        return <Database className="w-4 h-4 text-emerald-500" />;
      case 'devops':
      case 'devops & tools':
        return <Cpu className="w-4 h-4 text-blue-500" />;
      default:
        return <Code2 className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <section id="skills" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-mono font-bold text-orange-700 mb-3">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span>TECH STACK & CAPABILITIES</span>
          </div>
          <AnimatedHeading
            text="Technologies & Core Frameworks"
            className="text-3xl sm:text-4xl lg:text-5xl text-slate-900"
            highlightWords={['Technologies', 'Frameworks']}
          />
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Extensive practical experience in Python, PHP, modern JavaScript/TypeScript, Next.js, and scalable SQL/NoSQL databases.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSkills.map((skill, index) => (
            <FadeInOnScroll key={skill.name} delay={index * 0.04} direction="up">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-orange-400 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-50/80 border border-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getCategoryIcon(skill.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                        {skill.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                    {skill.level}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden relative mt-4">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: 'var(--accent-color)',
                      boxShadow: '0 0 10px var(--accent-glow)',
                    }}
                  />
                </div>
              </motion.div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
