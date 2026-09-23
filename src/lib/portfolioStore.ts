import fs from 'fs';
import path from 'path';
import rawInitialData from '@/data/portfolio-data.json';

const bundledFilePath = path.join(process.cwd(), 'src', 'data', 'portfolio-data.json');
const tmpFilePath = process.platform === 'win32'
  ? path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'portfolio-3d-data.json')
  : '/tmp/portfolio-data.json';

// In-memory cache for fast, non-blocking serverless updates
let memoryCache: PortfolioData | null = null;

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatar: string;
  avatar3d: string;
  resumeUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  github: string;
  linkedin: string;
  twitter: string;
  location: string;
  statusBadge?: string;
  heroGreeting?: string;
  techBadgeText?: string;
  codeStatus?: string;
  codeRole?: string;
  codeVibe?: string;
  nowPlaying?: string;
  storyHeading?: string;
  storyP1?: string;
  storyP2?: string;
  storyP3?: string;
}

export interface EducationItem {
  id: string;
  level: string;
  degree: string;
  institution: string;
  year: string;
  score: string;
  highlights: string[];
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl?: string;
  image: string;
  category?: string;
  languages: string[];
  frameworks: string[];
  database: string;
  tags: string[];
  featured: boolean;
}

export interface ThemeConfig {
  bgColor: string;
  accentColor: string;
  textColor: string;
  glowColor: string;
  preset: string;
}

export interface PortfolioData {
  profile: Profile;
  educationList: EducationItem[];
  skills: Skill[];
  projects: Project[];
  theme: ThemeConfig;
}

function sanitizeData(data: any): PortfolioData {
  if (!data) return rawInitialData as unknown as PortfolioData;
  const cloned = JSON.parse(JSON.stringify(data));
  if (!cloned.educationList && cloned.education) {
    const oldEdu = cloned.education;
    cloned.educationList = [
      {
        id: 'edu-mca',
        level: 'MCA',
        degree: oldEdu.degree || 'Master of Computer Applications (MCA)',
        institution: oldEdu.college || 'Apex Institute of Science & Technology',
        year: oldEdu.year || '2024 - 2026',
        score: oldEdu.score || '8.8 CGPA',
        highlights: oldEdu.highlights || [],
      },
    ];
  }
  if (!cloned.profile) {
    cloned.profile = (rawInitialData as any).profile || {};
  }
  if (!cloned.profile.avatar3d) {
    cloned.profile.avatar3d = '/avatar_3d_cutout.png';
  }
  if (!cloned.profile.whatsapp) {
    cloned.profile.whatsapp = '+919876543210';
  }
  if (!cloned.profile.instagram) {
    cloned.profile.instagram = 'https://instagram.com';
  }
  return cloned as PortfolioData;
}

export function getPortfolioData(): PortfolioData {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Try reading from writable serverless /tmp path first (if written during runtime)
  try {
    if (fs.existsSync(tmpFilePath)) {
      const raw = fs.readFileSync(tmpFilePath, 'utf8');
      const data = JSON.parse(raw);
      memoryCache = sanitizeData(data);
      return memoryCache;
    }
  } catch (e) {
    console.warn('Could not read from tmpFilePath:', e);
  }

  // 2. Try reading from bundled file path on disk (works locally)
  try {
    if (fs.existsSync(bundledFilePath)) {
      const raw = fs.readFileSync(bundledFilePath, 'utf8');
      const data = JSON.parse(raw);
      memoryCache = sanitizeData(data);
      try {
        fs.writeFileSync(tmpFilePath, JSON.stringify(memoryCache, null, 2), 'utf8');
      } catch {}
      return memoryCache;
    }
  } catch {}

  // 3. Fallback to imported data from module bundle (NEVER FAILS ON VERCEL)
  memoryCache = sanitizeData(rawInitialData);
  return memoryCache;
}

export function savePortfolioData(data: PortfolioData): void {
  // Update in-memory cache immediately
  memoryCache = data;

  // 1. Write to writable serverless /tmp
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (tmpErr) {
    console.warn('Could not write to tmpFilePath:', tmpErr);
  }

  // 2. Try writing to bundled path (works locally, safely ignored on Vercel read-only filesystem)
  try {
    fs.writeFileSync(bundledFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Expected on Vercel serverless read-only filesystem
    console.log('Running on serverless/read-only environment. Data saved to /tmp and memory.');
  }

  // 3. Trigger GitHub sync if token is available
  syncToGitHub(data).catch((e) => console.warn('Background GitHub sync:', e));
}

async function syncToGitHub(data: PortfolioData) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'Hanuman76/portfolio';
  if (!token) return;

  try {
    const apiUrl = `https://api.github.com/repos/${repo}/contents/src/data/portfolio-data.json`;
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Admin-Sync',
      },
    });

    if (!res.ok) return;

    const fileInfo = await res.json();
    const sha = fileInfo.sha;
    const content = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');

    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Admin-Sync',
      },
      body: JSON.stringify({
        message: 'chore(data): auto-update portfolio from admin panel',
        content,
        sha,
        branch: 'main',
      }),
    });
  } catch (err) {
    console.warn('GitHub sync failed:', err);
  }
}
