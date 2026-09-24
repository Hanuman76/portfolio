'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import CodeAboutSection from '@/components/sections/CodeAboutSection';
import AboutSection from '@/components/sections/AboutSection';
import TechStackSection from '@/components/sections/TechStackSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import Footer from '@/components/ui/Footer';
import type { PortfolioData } from '@/lib/portfolioStore';

const STORAGE_KEY = 'portfolio_user_data';

export default function HomeClient({ initialData }: { initialData: PortfolioData }) {
  const [data, setData] = useState<PortfolioData>(initialData);

  useEffect(() => {
    // 1. Immediately check localStorage (failsafe client-side persistence across refresh)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.profile) {
          setData(parsed);
        }
      } else {
        // Seed localStorage with server initial data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }

    // 2. Fetch fresh data from API in background
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/portfolio', { cache: 'no-store' });
        if (res.ok) {
          const freshData: PortfolioData = await res.json();
          const stored = localStorage.getItem(STORAGE_KEY);
          
          if (!stored) {
            setData(freshData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
          } else {
            const parsedStored = JSON.parse(stored);
            const serverUpdated = freshData.lastUpdated || 0;
            const localUpdated = parsedStored.lastUpdated || 0;

            // If server has newer data than local storage, update
            if (serverUpdated > localUpdated) {
              setData(freshData);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch portfolio API:', err);
      }
    };
    fetchLatest();

    // 3. Listen for updates triggered by Admin panel in same or other tabs
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.profile) {
            setData(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to parse updated localStorage:', e);
      }
    };

    window.addEventListener('portfolio_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('portfolio_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [initialData]);

  return (
    <div className="relative min-h-screen selection:bg-emerald-500 selection:text-white bg-[#fdfdfd]">
      {/* Cyber Initial Loading Screen */}
      <LoadingScreen />

      {/* Floating Pill Dock Header */}
      <Navbar profile={data.profile} />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 1. Hero: Greeting, Title, Orbiting Badges & Photo */}
        <HeroSection profile={data.profile} />

        {/* 2. About: Code IDE Card */}
        <CodeAboutSection profile={data.profile} />

        {/* 3. Academic Foundation & Education Timeline */}
        <AboutSection profile={data.profile} educationList={data.educationList} />

        {/* 4. Tech: Tooling & Stack */}
        <TechStackSection skills={data.skills} />

        {/* 5. Projects: Interactive Video-Style Frame Cards */}
        <ProjectsSection projects={data.projects} />
      </main>

      {/* Clean Minimal Footer */}
      <Footer profile={data.profile} />
    </div>
  );
}