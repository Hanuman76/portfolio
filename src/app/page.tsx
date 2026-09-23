import React from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import CodeAboutSection from '@/components/sections/CodeAboutSection';
import AboutSection from '@/components/sections/AboutSection';
import TechStackSection from '@/components/sections/TechStackSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import Footer from '@/components/ui/Footer';
import { getPortfolioData } from '@/lib/portfolioStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic server rendering to fetch fresh data on updates

export default function HomePage() {
  const data = getPortfolioData();

  return (
    <div className="relative min-h-screen selection:bg-emerald-500 selection:text-white bg-[#fdfdfd]">
      {/* Cyber Initial Loading Screen (Reel Opening Frame) */}
      <LoadingScreen />

      {/* Floating Pill Dock Header */}
      <Navbar profile={data.profile} />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 1. Hero: Hi, I'm Devraj Ancheriya Web Developer + Orbiting Badges Photo */}
        <HeroSection profile={data.profile} />

        {/* 2. About: Code IDE Card + 'Turning imagination into interactive reality' */}
        <CodeAboutSection profile={data.profile} />

        {/* 3. Academic Foundation & Education Timeline (School, BCA, MCA) */}
        <AboutSection profile={data.profile} educationList={data.educationList} />

        {/* 4. Tech: Tooling & Stack */}
        <TechStackSection skills={data.skills} />

        {/* 5. Projects: Video-Style Capsule Framed Cards */}
        <ProjectsSection projects={data.projects} />
      </main>

      {/* Clean Minimal Footer */}
      <Footer profile={data.profile} />
    </div>
  );
}
