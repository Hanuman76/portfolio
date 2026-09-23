'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/portfolioStore';

export default function ProjectsSection({ projects = [] }: { projects: Project[] }) {
  const [projectList, setProjectList] = useState<Project[]>(projects);

  useEffect(() => {
    // Keep in sync with initial props
    if (projects && projects.length > 0) {
      setProjectList(projects);
    }

    // Also fetch fresh projects from API
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setProjectList(data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch latest projects:', err);
      }
    };

    fetchLatest();

    // Listen for real-time admin updates in same browser session
    const handleStorageUpdate = () => fetchLatest();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('portfolio_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('portfolio_updated', handleStorageUpdate);
    };
  }, [projects]);

  return (
    <section id="projects" className="py-24 bg-[#fdfdfd] relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching reel */}
        <div className="flex flex-col items-start mb-14">
          <span className="text-xs font-mono tracking-widest text-emerald-700 uppercase font-bold mb-2">
            FEATURED WORK
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Projects.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
            Selected client web platforms and production software systems built with modern architectures.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-start">
          {projectList.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col group cursor-pointer"
            >
              {/* Project Image Card */}
              <a
                href={project.liveUrl || project.githubUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="relative block w-full rounded-[38px] p-2 bg-slate-100 border-[2.5px] border-slate-300 hover:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-xl group-hover:scale-[1.01]"
              >
                <div className="relative h-64 sm:h-72 w-full rounded-[30px] overflow-hidden bg-slate-200">
                  <Image
                    src={project.image || '/project_fbv.jpg'}
                    alt={project.title}
                    fill
                    unoptimized
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Circular Center Hover Arrow Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/95 text-slate-900 shadow-2xl border border-slate-200 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-115 transition-all">
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Title & Metadata */}
              <div className="mt-5 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {project.title}
                  </h3>
                  {project.database && (
                    <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 shrink-0">
                      {project.database}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                  {(project.languages || []).map((lang, lIdx) => (
                    <span
                      key={lIdx}
                      className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {lang}
                    </span>
                  ))}
                  {(project.frameworks || []).map((fw, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {fw}
                    </span>
                  ))}
                </div>

                {/* Action Links */}
                <div className="mt-5 flex items-center gap-4 text-xs font-bold font-mono">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                    >
                      <span>Live Preview</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 hover:text-slate-950 underline flex items-center gap-1"
                    >
                      <span>GitHub Code</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
