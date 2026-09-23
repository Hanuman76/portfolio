'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/portfolioStore';

export default function ProjectsSection({ projects }: { projects: Project[] }) {
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

        {/* Exact Projects Grid from Reel (detail_17s.jpg / project_crop.jpg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-start">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col group cursor-pointer"
            >
              {/* Image Frame: Capsule Rounded Container with Outer Border (Exact from Reel) */}
              <a
                href={project.liveUrl || project.githubUrl}
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

                  {/* Circular Center Hover Arrow Button (Directly from Reel) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/95 text-slate-900 shadow-2xl border border-slate-200 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-115 transition-all">
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Text Content Directly Below Image on Clean Canvas */}
              <div className="pt-5 px-2">
                {/* Subtitle / Category from Reel */}
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 font-semibold block mb-1">
                  {project.category || (project.languages?.[0] ? `${project.languages[0]} PLATFORM` : 'WEB APPLICATION')}
                </span>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                  <a href={project.liveUrl || project.githubUrl} target="_blank" rel="noreferrer">
                    {project.title}
                  </a>
                </h3>

                {/* Description */}
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {project.description}
                </p>

                {/* Tech stack row (Clean, spaced out format from Reel) */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-mono text-slate-500 font-medium">
                  {project.languages?.map((l, lIdx) => (
                    <span key={lIdx} className="hover:text-slate-900 transition-colors">
                      {l}
                    </span>
                  ))}
                  {project.frameworks?.map((f, fIdx) => (
                    <span key={fIdx} className="hover:text-slate-900 transition-colors">
                      {f}
                    </span>
                  ))}
                  {project.database && (
                    <span className="hover:text-slate-900 transition-colors text-emerald-700 font-bold">
                      {project.database}
                    </span>
                  )}
                </div>

                {/* Direct GitHub and Demo links */}
                <div className="mt-5 flex items-center gap-4 text-xs font-mono">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-900 font-bold hover:text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <span>GitHub Repo</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Live Site</span>
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

