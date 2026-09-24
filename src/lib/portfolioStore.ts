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
  lastUpdated?: number;
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
  if (!cloned.projects || !Array.isArray(cloned.projects)) {
    cloned.projects = (rawInitialData as any).projects || [];
  }
  return cloned as PortfolioData;
}

export function getPortfolioData(): PortfolioData {
  if (memoryCache) {
    return memoryCache;
  }

  let diskData: PortfolioData | null = null;
  let diskMtime = 0;
  let tmpData: PortfolioData | null = null;
  let tmpMtime = 0;

  // 1. Read bundled data from src/data/portfolio-data.json (Primary in local dev & persistent updates)
  try {
    if (fs.existsSync(bundledFilePath)) {
      const stats = fs.statSync(bundledFilePath);
      diskMtime = stats.mtimeMs;
      const raw = fs.readFileSync(bundledFilePath, 'utf8');
      diskData = sanitizeData(JSON.parse(raw));
    }
  } catch (e) {
    console.warn('Could not read from bundledFilePath:', e);
  }

  // 2. Read from writable /tmp path (Used in serverless Vercel environments during runtime)
  try {
    if (fs.existsSync(tmpFilePath)) {
      const stats = fs.statSync(tmpFilePath);
      tmpMtime = stats.mtimeMs;
      const raw = fs.readFileSync(tmpFilePath, 'utf8');
      tmpData = sanitizeData(JSON.parse(raw));
    }
  } catch (e) {
    console.warn('Could not read from tmpFilePath:', e);
  }

  // Compare timestamps: if tmpData was updated after diskData (e.g. on serverless runtime), use it
  if (diskData && tmpData) {
    memoryCache = tmpMtime > diskMtime ? tmpData : diskData;
    return memoryCache;
  }

  if (diskData) {
    memoryCache = diskData;
    return memoryCache;
  }

  if (tmpData) {
    memoryCache = tmpData;
    return memoryCache;
  }

  // 3. Fallback to imported bundled data (NEVER FAILS)
  memoryCache = sanitizeData(rawInitialData);
  return memoryCache;
}

export function savePortfolioData(data: PortfolioData): void {
  const sanitized = sanitizeData(data);
  sanitized.lastUpdated = Date.now();
  memoryCache = sanitized;

  // 1. Write to bundled path on disk (works locally and updates Git-tracked source file)
  try {
    fs.writeFileSync(bundledFilePath, JSON.stringify(sanitized, null, 2), 'utf8');
  } catch {
    // Expected on Vercel serverless read-only filesystem
  }

  // 2. Write to writable serverless /tmp
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(sanitized, null, 2), 'utf8');
  } catch (tmpErr) {
    console.warn('Could not write to tmpFilePath:', tmpErr);
  }

  // 3. Trigger GitHub sync if GITHUB_TOKEN is configured
  syncToGitHub(sanitized).catch((e) => console.warn('Background GitHub sync:', e));
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