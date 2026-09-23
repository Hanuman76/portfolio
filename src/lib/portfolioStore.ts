import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'portfolio-data.json');

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
  level: string; // e.g. "MCA", "BCA", "Senior Secondary (12th)", "Secondary (10th)", "Certifications"
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
  category?: string;    // e.g. "WEDDING PHOTOGRAPHY PORTFOLIO", "SAFARI BOOKING PLATFORM"
  languages: string[];  // e.g. ["Python", "PHP", "TypeScript"]
  frameworks: string[]; // e.g. ["Next.js", "Laravel", "Django"]
  database: string;     // e.g. "MongoDB", "MySQL", "PostgreSQL"
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

export function getPortfolioData(): PortfolioData {
  try {
    if (!fs.existsSync(dataFilePath)) {
      throw new Error(`Data file not found at ${dataFilePath}`);
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(raw);

    // Backward compatibility for single education object to array
    if (!data.educationList && (data as any).education) {
      const oldEdu = (data as any).education;
      data.educationList = [
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

    // Default 3d avatar fallback
    if (!data.profile.avatar3d) {
      data.profile.avatar3d = '/avatar_3d_cutout.png';
    }
    if (!data.profile.whatsapp) {
      data.profile.whatsapp = '+919876543210';
    }
    if (!data.profile.instagram) {
      data.profile.instagram = 'https://instagram.com';
    }

    return data;
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    throw error;
  }
}

export function savePortfolioData(data: PortfolioData): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing portfolio data:', error);
    throw error;
  }
}
