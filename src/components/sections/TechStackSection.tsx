'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Server, Database, Cpu, Terminal, Layers } from 'lucide-react';
import type { Skill } from '@/lib/portfolioStore';

export default function TechStackSection({ skills = [] }: { skills?: Skill[] }) {
  const techCategories = [
    {
      name: 'Frontend & UI',
      icon: Layers,
      items: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
    {
      name: 'Backend & APIs',
      icon: Server,
      items: ['Python', 'PHP', 'Node.js', 'REST APIs', 'Express.js'],
    },
    {
      name: 'Databases & Storage',
      icon: Database,
      items: ['MySQL', 'MongoDB', 'PostgreSQL', 'Supabase', 'Redis'],
    },
    {
      name: 'Tools & DevOps',
      icon: Cpu,
      items: ['Git & GitHub', 'Docker', 'Vercel', 'Postman', 'Linux CLI'],
    },
  ];

  return (
    <section id="tech" className="py-20 bg-white relative z-10 border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 mb-3">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>TOOLING & CAPABILITIES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Tech Stack.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
            Practical full-stack competencies applied in building production web applications and academic software systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techCategories.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-[#fafafa] rounded-3xl p-6 border border-slate-200 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-3">{cat.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-mono font-medium shadow-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
