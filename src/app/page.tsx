import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getPortfolioData } from '@/lib/portfolioStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic server rendering to fetch fresh data on updates

export default function HomePage() {
  const data = getPortfolioData();
  return <HomeClient initialData={data} />;
}