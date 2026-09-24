'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  FolderGit2,
  GraduationCap,
  Palette,
  User,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  Lock,
  LogOut,
  Phone,
  Mail,
  Code,
  Terminal,
  Database,
  Camera,
  Layers,
  FileText,
  FolderOpen,
  Upload,
  Loader2,
  HardDrive,
  Download,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, WhatsappIcon, InstagramIcon } from '@/components/ui/Icons';
import type { PortfolioData, Project, EducationItem } from '@/lib/portfolioStore';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'education' | 'site-text' | 'profile' | 'theme' | 'backup'>('projects');
  const [isPushingGit, setIsPushingGit] = useState(false);
  const [gitStatusMessage, setGitStatusMessage] = useState<string | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Loaded portfolio data
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Project modal state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    image: '/my_photo.jpg',
    languages: [],
    frameworks: [],
    database: 'MongoDB',
    tags: [],
    featured: true,
  });
  const [langInput, setLangInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Education modal state
  const [isEditingEdu, setIsEditingEdu] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<Partial<EducationItem>>({
    level: 'MCA',
    degree: '',
    institution: '',
    year: '',
    score: '',
    highlights: [],
  });
  const [highlightInput, setHighlightInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      let localData: PortfolioData | null = null;
      try {
        const stored = localStorage.getItem('portfolio_user_data');
        if (stored) {
          localData = JSON.parse(stored);
          if (localData && localData.profile) {
            setData(localData);
          }
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }

      const res = await fetch('/api/portfolio', { cache: 'no-store' });
      if (res.ok) {
        const apiData = await res.json();
        if (!localData) {
          setData(apiData);
          try {
            localStorage.setItem('portfolio_user_data', JSON.stringify(apiData));
          } catch {}
        } else {
          const apiTime = apiData.lastUpdated || 0;
          const localTime = localData.lastUpdated || 0;
          if (apiTime > localTime) {
            setData(apiData);
            try {
              localStorage.setItem('portfolio_user_data', JSON.stringify(apiData));
            } catch {}
          } else {
            fetch('/api/portfolio', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localData),
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('portfolio_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin1947') {
      setIsAuthenticated(true);
      localStorage.setItem('portfolio_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid Passcode! Please enter correct passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('portfolio_admin_auth');
  };

  const showNotification = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3500);
    try {
      window.dispatchEvent(new Event('portfolio_updated'));
      localStorage.setItem('portfolio_last_updated', Date.now().toString());
    } catch {}
  };

  const persistData = (updatedData: PortfolioData, message?: string) => {
    const withTimestamp: PortfolioData = {
      ...updatedData,
      lastUpdated: Date.now(),
    };
    setData(withTimestamp);
    try {
      localStorage.setItem('portfolio_user_data', JSON.stringify(withTimestamp));
      localStorage.setItem('portfolio_last_updated', Date.now().toString());
      window.dispatchEvent(new Event('portfolio_updated'));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    if (message) {
      showNotification(message);
    }
    return withTimestamp;
  };

  const handleExportBackup = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup file downloaded to your computer!');
  };

  const handleImportBackup = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || !parsed.profile) {
          alert('Invalid backup file format.');
          return;
        }
        persistData(parsed, 'Portfolio restored from backup file!');
        await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        alert('All portfolio data, projects, photos, and texts restored successfully!');
      } catch (err: any) {
        alert('Failed to parse JSON backup: ' + err?.message);
      }
    };
    reader.readAsText(file);
  };

  const handleGitSync = async () => {
    setIsPushingGit(true);
    setGitStatusMessage(null);
    try {
      const res = await fetch('/api/git-sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setGitStatusMessage(json.message);
        showNotification('🚀 Pushed to GitHub! Vercel is now deploying your changes live.');
      } else {
        setGitStatusMessage(json.message || 'Git sync failed');
        alert(json.message || 'Git sync not available in this environment. All changes remain safely saved in your browser.');
      }
    } catch (e: any) {
      setGitStatusMessage('Git sync error: ' + e?.message);
    } finally {
      setIsPushingGit(false);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm('Are you sure you want to reset all data back to original defaults? This will erase local changes.')) return;
    try {
      localStorage.removeItem('portfolio_user_data');
      localStorage.removeItem('portfolio_last_updated');
      window.dispatchEvent(new Event('portfolio_updated'));
      window.location.reload();
    } catch {}
  };

  // File Upload State & Refs for Folder-based browsing
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const avatar3dFileRef = useRef<HTMLInputElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
  const [uploadingField, setUploadingField] = useState<'avatar' | 'avatar3d' | 'project' | null>(null);

  function optimizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.88): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        const isPng = file.type === 'image/png';
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('/my_photo.jpg');
    reader.readAsDataURL(file);
  });
}

  const handleUploadFile = async (
    file: File,
    targetField: 'avatar' | 'avatar3d' | 'project'
  ) => {
    if (!file) return;
    setUploadingField(targetField);
    try {
      // 1. Instantly compress client-side and generate high-speed base64 URL
      const isCutout = targetField === 'avatar3d';
      const dataUrl = await optimizeImage(
        file,
        isCutout ? 1000 : 800,
        isCutout ? 1000 : 800,
        isCutout ? 0.95 : 0.88
      );

      // 2. Immediately update state & localStorage (instant 0ms feedback)
      if (targetField === 'avatar' && data) {
        const updatedProfile = { ...data.profile, avatar: dataUrl };
        persistData({ ...data, profile: updatedProfile }, 'Circular profile photo updated and saved permanently!');
      } else if (targetField === 'avatar3d' && data) {
        const updatedProfile = { ...data.profile, avatar3d: dataUrl };
        persistData({ ...data, profile: updatedProfile }, 'Avatar 3D cutout updated and saved permanently!');
      } else if (targetField === 'project') {
        setCurrentProject((prev) => ({ ...prev, image: dataUrl }));
        showNotification('Project photo selected and applied!');
      }

      // 3. Upload to server in background
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target', targetField);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          if (result && result.url) {
            if (targetField === 'avatar' && data) {
              const updatedProfile = { ...data.profile, avatar: result.url };
              persistData({ ...data, profile: updatedProfile });
              await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: updatedProfile }),
              });
            } else if (targetField === 'avatar3d' && data) {
              const updatedProfile = { ...data.profile, avatar3d: result.url };
              persistData({ ...data, profile: updatedProfile });
              await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: updatedProfile }),
              });
            } else if (targetField === 'project') {
              setCurrentProject((prev) => ({ ...prev, image: result.url }));
            }
          }
        }
      } catch (bgErr) {
        console.warn('Background server sync completed via base64 fallback');
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      alert(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  // Projects CRUD
  const openNewProject = () => {
    setCurrentProject({
      title: '',
      description: '',
      githubUrl: 'https://github.com/devraj/',
      liveUrl: 'https://',
      image: '/my_photo.jpg',
      languages: ['Python', 'TypeScript'],
      frameworks: ['FastAPI', 'Next.js'],
      database: 'MongoDB',
      tags: [],
      featured: true,
    });
    setLangInput('Python, TypeScript');
    setFrameworkInput('FastAPI, Next.js');
    setTagInput('Backend, Cloud');
    setIsEditingProject(true);
  };

  const openEditProject = (proj: Project) => {
    setCurrentProject(proj);
    setLangInput((proj.languages || []).join(', '));
    setFrameworkInput((proj.frameworks || []).join(', '));
    setTagInput((proj.tags || []).join(', '));
    setIsEditingProject(true);
  };

  const handleSaveProject = async () => {
    if (!currentProject.title) return;
    try {
      const isNew = !currentProject.id;
      const url = '/api/projects';
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        ...currentProject,
        languages: langInput.split(',').map((s) => s.trim()).filter(Boolean),
        frameworks: frameworkInput.split(',').map((s) => s.trim()).filter(Boolean),
        tags: tagInput.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json().catch(() => ({}));

      const savedProject: Project = resJson.project || {
        id: currentProject.id || `proj-${Date.now()}`,
        title: currentProject.title || 'Untitled Project',
        description: currentProject.description || '',
        githubUrl: currentProject.githubUrl || '',
        liveUrl: currentProject.liveUrl || '',
        image: currentProject.image || '/my_photo.jpg',
        languages: langInput.split(',').map((s) => s.trim()).filter(Boolean),
        frameworks: frameworkInput.split(',').map((s) => s.trim()).filter(Boolean),
        database: currentProject.database || 'MongoDB',
        tags: tagInput.split(',').map((s) => s.trim()).filter(Boolean),
        featured: currentProject.featured ?? true,
      };

      if (res.ok && data) {
        setIsEditingProject(false);
        const updatedProjects: Project[] = isNew
          ? [savedProject, ...(data.projects || [])]
          : (data.projects || []).map((p) => (p.id === savedProject.id ? savedProject : p));
        persistData({ ...data, projects: updatedProjects }, 'Project details & GitHub links saved permanently!');
      } else {
        alert(resJson.error || 'Failed to save project.');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error saving project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      const resJson = await res.json().catch(() => ({}));
      if (res.ok && data) {
        const updatedProjects = (data.projects || []).filter((p) => p.id !== id);
        persistData({ ...data, projects: updatedProjects }, 'Project successfully deleted!');
      } else {
        alert(resJson.error || 'Failed to delete project.');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Error deleting project.');
    }
  };

  // Education CRUD
  const openNewEducation = () => {
    setCurrentEdu({
      id: `edu-${Date.now()}`,
      level: 'BCA',
      degree: '',
      institution: '',
      year: '',
      score: '',
      highlights: [],
    });
    setHighlightInput('');
    setIsEditingEdu(true);
  };

  const openEditEducation = (item: EducationItem) => {
    setCurrentEdu(item);
    setHighlightInput((item.highlights || []).join('\n'));
    setIsEditingEdu(true);
  };

  const handleSaveEducation = async () => {
    if (!data || !currentEdu.degree) return;
    const isNew = !data.educationList.some((e) => e.id === currentEdu.id);
    const updatedItem: EducationItem = {
      id: currentEdu.id || `edu-${Date.now()}`,
      level: currentEdu.level || 'MCA',
      degree: currentEdu.degree || '',
      institution: currentEdu.institution || '',
      year: currentEdu.year || '',
      score: currentEdu.score || '',
      highlights: highlightInput.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    let updatedList = [...data.educationList];
    if (isNew) {
      updatedList.push(updatedItem);
    } else {
      updatedList = updatedList.map((e) => (e.id === updatedItem.id ? updatedItem : e));
    }

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ educationList: updatedList }),
      });
      if (res.ok) {
        setIsEditingEdu(false);
        persistData({ ...data, educationList: updatedList }, 'Education record updated permanently!');
      }
    } catch (err) {
      console.error('Failed to update education:', err);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!data || !confirm('Delete this education entry?')) return;
    const updatedList = data.educationList.filter((e) => e.id !== id);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ educationList: updatedList }),
      });
      if (res.ok) {
        persistData({ ...data, educationList: updatedList }, 'Education record deleted!');
      }
    } catch (err) {
      console.error('Failed to delete education:', err);
    }
  };

  // Profile Channels & Site Texts Saver
  const handleSaveProfile = async () => {
    if (!data) return;
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: data.profile }),
      });
      persistData(data, 'All site texts, headings & profile saved permanently!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating texts: ' + err);
    }
  };

  // Theme Saver
  const handleSaveTheme = async () => {
    if (!data) return;
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.theme),
      });
      if (res.ok) {
        document.documentElement.style.setProperty('--accent-color', data.theme.accentColor);
        document.documentElement.style.setProperty('--bg-color', data.theme.bgColor);
        document.documentElement.style.setProperty('--text-color', data.theme.textColor);
        document.documentElement.style.setProperty('--accent-glow', `${data.theme.accentColor}55`);
        persistData({ ...data, theme: data.theme }, 'Theme configuration saved permanently!');
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  // Login Screen (Clean White & Orange high contrast)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-orange-200 shadow-2xl relative text-slate-900">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-6 border border-orange-200 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-center text-slate-900">Portfolio Admin Portal</h2>
          <p className="text-sm text-center text-slate-600 mt-1 mb-6">
            Enter authorized passcode to manage Projects, School/BCA/MCA Education, WhatsApp, and Profiles.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">
                Admin Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30"
            >
              Authenticate & Access
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <a href="/" className="text-xs text-slate-500 hover:text-orange-600 font-semibold flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portfolio</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-300 text-slate-700 hover:text-orange-700 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Live Site</span>
          </a>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 block leading-tight">
                Developer Admin Control Panel
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Full Access Mode</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 font-mono bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300 font-bold shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {saveStatus}
            </span>
          )}

          <button
            onClick={handleGitSync}
            disabled={isPushingGit}
            title="Deploy changes to live site via GitHub"
            className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold px-3 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {isPushingGit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Push to GitHub / Vercel</span>
          </button>

          <button
            onClick={handleExportBackup}
            title="Download JSON backup file"
            className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Backup</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Tabs - High Contrast & Clearly Legible */}
        <div className="flex flex-wrap items-center gap-3 border-b-2 border-slate-200 pb-5 mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'projects'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>GitHub Projects ({data?.projects?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'education'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>School / BCA / MCA Education ({data?.educationList?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('site-text')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'site-text'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Site Texts &amp; Headings</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'profile'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Photo, WhatsApp & Socials</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'backup'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Data Storage &amp; Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'theme'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme Colors</span>
          </button>
        </div>

        {/* Tab 1: Projects Showcase CRUD */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Manage GitHub Projects & Tech Stack</h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Update project repositories, codes used (Python, PHP, etc.), frameworks, and databases.
                </p>
              </div>

              <button
                onClick={openNewProject}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/30 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add GitHub Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data?.projects?.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-orange-300 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-extrabold text-lg text-slate-900">{proj.title}</h4>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {proj.database || 'Database'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 font-normal line-clamp-2 mb-4 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="space-y-2 text-xs mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-800">
                        <Code className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-mono text-xs">
                          <strong className="text-slate-900">Languages:</strong> {(proj.languages || []).join(', ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Terminal className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono text-xs">
                          <strong className="text-slate-900">Framework:</strong> {(proj.frameworks || []).join(', ') || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 font-mono"
                    >
                      <GithubIcon className="w-4 h-4 text-slate-900" />
                      <span>View GitHub Repo</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProject(proj)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: School / BCA / MCA Education CRUD */}
        {activeTab === 'education' && data && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Academic Qualifications (School, BCA, MCA)</h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Add, edit, or remove School (10th/12th), BCA, MCA degree, or Certifications.
                </p>
              </div>

              <button
                onClick={openNewEducation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/30 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Qualification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.educationList.map((edu) => (
                <div
                  key={edu.id}
                  className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-orange-300 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                        {edu.level}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{edu.year}</span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 mt-2">{edu.degree}</h4>
                    <p className="text-xs font-medium text-slate-600 mt-1">{edu.institution}</p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between font-mono">
                      <span className="text-slate-500">Score / Grade:</span>
                      <span className="font-bold text-emerald-700">{edu.score}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditEducation(edu)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: All Site Texts & Headings */}
        {activeTab === 'site-text' && data && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-4xl space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Manage All Site Texts, Headings &amp; Bio</h2>
              <p className="text-xs text-slate-600 font-medium">
                Update every word, title, story paragraph, and hero caption on your portfolio in real time.
              </p>
            </div>

            {/* Section 1: Hero Texts */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>1. Hero Section Texts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Live Status Badge Text
                  </label>
                  <input
                    type="text"
                    value={data.profile.statusBadge ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, statusBadge: e.target.value } })
                    }
                    placeholder="Available for work"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Hero Greeting Line
                  </label>
                  <input
                    type="text"
                    value={data.profile.heroGreeting ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, heroGreeting: e.target.value } })
                    }
                    placeholder="Hi, I'm"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Developer Name
                  </label>
                  <input
                    type="text"
                    value={data.profile.name ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, name: e.target.value } })
                    }
                    placeholder="Devraj Ancheriya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Main Title (e.g. Web Developer)
                  </label>
                  <input
                    type="text"
                    value={data.profile.title ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, title: e.target.value } })
                    }
                    placeholder="Web Developer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Hero Subtitle Tagline
                </label>
                <input
                  type="text"
                  value={data.profile.tagline ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, tagline: e.target.value } })
                  }
                  placeholder="I build web apps for small businesses & modern enterprises."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Tech Badge Tagline
                </label>
                <input
                  type="text"
                  value={data.profile.techBadgeText ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, techBadgeText: e.target.value } })
                  }
                  placeholder="Building production-ready web apps"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 2: Mac Code Window Texts */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>2. Mac Code Editor IDE Texts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Code Status
                  </label>
                  <input
                    type="text"
                    value={data.profile.codeStatus ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, codeStatus: e.target.value } })
                    }
                    placeholder="Building & Learning"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-xs font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Code Role
                  </label>
                  <input
                    type="text"
                    value={data.profile.codeRole ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, codeRole: e.target.value } })
                    }
                    placeholder="MCA Scholar // Full-Stack"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-xs font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                    Code Vibe
                  </label>
                  <input
                    type="text"
                    value={data.profile.codeVibe ?? ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, codeVibe: e.target.value } })
                    }
                    placeholder="Clean code & Chai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-xs font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Now Playing Music Track
                </label>
                <input
                  type="text"
                  value={data.profile.nowPlaying ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, nowPlaying: e.target.value } })
                  }
                  placeholder="Lofi Hip Hop Radio - Beats to relax/study to"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-xs font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Story & Narrative Texts */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>3. Story &amp; About Narrative Paragraphs</span>
              </h3>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Story Main Headline
                </label>
                <input
                  type="text"
                  value={data.profile.storyHeading ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, storyHeading: e.target.value } })
                  }
                  placeholder="Turning imagination into interactive reality."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Paragraph 1 (Developer Background &amp; Core Stack)
                </label>
                <textarea
                  rows={3}
                  value={data.profile.storyP1 ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, storyP1: e.target.value } })
                  }
                  placeholder="I'm a web developer who builds..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-normal focus:border-orange-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Paragraph 2 (Delivery Speed &amp; Production Features)
                </label>
                <textarea
                  rows={2}
                  value={data.profile.storyP2 ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, storyP2: e.target.value } })
                  }
                  placeholder="I move fast from planning..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-normal focus:border-orange-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1.5">
                  Paragraph 3 (Academic MCA / BCA Foundation)
                </label>
                <textarea
                  rows={2}
                  value={data.profile.storyP3 ?? ''}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, storyP3: e.target.value } })
                  }
                  placeholder="Postgraduate Scholar..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-normal focus:border-orange-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>Save All Site Texts &amp; Headings</span>
            </button>
          </div>
        )}

        {/* Tab 3: Profile Photo, WhatsApp & Social Channels */}
        {activeTab === 'profile' && data && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-3xl">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Profile Photo, WhatsApp & Channels</h2>
            <p className="text-xs text-slate-600 font-medium mb-6">
              Update your photo paths, WhatsApp chat number, Instagram handle, and bio information.
            </p>

            <div className="space-y-5">
              {/* Photo Upload: Folder-Based & Direct Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-gradient-to-br from-orange-50/60 to-amber-50/40 border-2 border-orange-200">
                {/* 1. Circular Real Photo */}
                <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-mono uppercase text-slate-800 font-black flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-orange-600" />
                        <span>Circular Real Profile Photo</span>
                      </label>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Hero Section
                      </span>
                    </div>

                    {/* Live Preview & Choose Button */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-slate-100 shrink-0">
                        <Image
                          src={data.profile.avatar || '/my_photo.jpg'}
                          alt="Profile Real Photo"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => avatarFileRef.current?.click()}
                          disabled={uploadingField === 'avatar'}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {uploadingField === 'avatar' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading from folder...</span>
                            </>
                          ) : (
                            <>
                              <FolderOpen className="w-4 h-4" />
                              <span>ðŸ“ Choose Photo from Folder</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Click to browse your computer folder (JPG, PNG, WEBP).
                        </p>
                      </div>

                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadFile(file, 'avatar');
                        }}
                      />
                    </div>
                  </div>

                  {/* Manual Path Field */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-mono uppercase text-slate-500 font-semibold mb-1">
                      File Path / URL (Auto-set from folder)
                    </label>
                    <input
                      type="text"
                      value={data.profile.avatar || '/my_photo.jpg'}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, avatar: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Avatar Cutout PNG */}
                <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-mono uppercase text-slate-800 font-black flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-orange-600" />
                        <span>Avatar Cutout PNG</span>
                      </label>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        Transparent
                      </span>
                    </div>

                    {/* Live Preview & Click to Change */}
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        onClick={() => avatar3dFileRef.current?.click()}
                        title="Click to change cutout PNG"
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md shrink-0 flex items-center justify-center cursor-pointer group hover:opacity-90 transition-all"
                        style={{
                          backgroundImage:
                            'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%)',
                          backgroundPosition: '0 0, 8px 8px',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        <Image
                          src={data.profile.avatar3d || '/avatar_3d_cutout.png'}
                          alt="Avatar Cutout"
                          fill
                          unoptimized
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <Camera className="w-5 h-5 mb-0.5" />
                          <span>Change</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => avatar3dFileRef.current?.click()}
                          disabled={uploadingField === 'avatar3d'}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {uploadingField === 'avatar3d' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing Cutout...</span>
                            </>
                          ) : (
                            <>
                              <FolderOpen className="w-4 h-4" />
                              <span>Choose Cutout From Folder</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Select transparent PNG cutout file from your computer.
                        </p>
                      </div>

                      <input
                        ref={avatar3dFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onClick={(e) => {
                          (e.target as any).value = null;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadFile(file, 'avatar3d');
                        }}
                      />
                    </div>
                  </div>

                  {/* Manual Path Field with Apply Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-mono uppercase text-slate-500 font-semibold mb-1">
                      Or Paste Cutout Image URL / File Path
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.profile.avatar3d || ''}
                        onChange={(e) =>
                          setData({ ...data, profile: { ...data.profile, avatar3d: e.target.value } })
                        }
                        placeholder="/avatar_3d_cutout.png or https://..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono focus:border-orange-500 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          persistData(data, 'Cutout URL saved permanently!');
                          fetch('/api/portfolio', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ profile: data.profile }),
                          }).catch(() => {});
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">Developer Name</label>
                  <input
                    type="text"
                    value={data.profile.name}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, name: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">Title / Tagline</label>
                  <input
                    type="text"
                    value={data.profile.title}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, title: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">Bio Paragraph</label>
                <textarea
                  rows={3}
                  value={data.profile.bio}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, bio: e.target.value } })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-normal focus:border-orange-500 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              {/* WhatsApp & Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-emerald-800 font-bold mb-2 flex items-center gap-1.5">
                    <WhatsappIcon className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Number (e.g. +919876543210)</span>
                  </label>
                  <input
                    type="text"
                    value={data.profile.whatsapp || ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, whatsapp: e.target.value } })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-slate-900 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-pink-800 font-bold mb-2 flex items-center gap-1.5">
                    <InstagramIcon className="w-4 h-4 text-pink-600" />
                    <span>Instagram Profile Link</span>
                  </label>
                  <input
                    type="text"
                    value={data.profile.instagram || ''}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, instagram: e.target.value } })
                    }
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full px-4 py-2.5 rounded-xl bg-pink-50 border-2 border-pink-300 text-slate-900 text-sm font-semibold focus:border-pink-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, email: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={data.profile.phone}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, phone: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* LinkedIn & GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2 flex items-center gap-1.5">
                    <LinkedinIcon className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="text"
                    value={data.profile.linkedin}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, linkedin: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2 flex items-center gap-1.5">
                    <GithubIcon className="w-4 h-4 text-slate-900" />
                    <span>GitHub URL</span>
                  </label>
                  <input
                    type="text"
                    value={data.profile.github}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, github: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile, WhatsApp & Channels</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Theme Settings */}
        {activeTab === 'theme' && data && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-3xl">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Theme Colors & Preferences</h2>
            <p className="text-xs text-slate-600 font-medium mb-6">Configure system-wide default theme colors.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Primary Accent Glow Color</h4>
                  <p className="text-xs text-slate-600">Controls buttons, orbits, and tech badges</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.theme.accentColor}
                    onChange={(e) =>
                      setData({ ...data, theme: { ...data.theme, accentColor: e.target.value } })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{data.theme.accentColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Background Color</h4>
                  <p className="text-xs text-slate-600">Base background color</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.theme.bgColor}
                    onChange={(e) =>
                      setData({ ...data, theme: { ...data.theme, bgColor: e.target.value } })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{data.theme.bgColor}</span>
                </div>
              </div>

              <button
                onClick={handleSaveTheme}
                className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Theme Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: Data Storage, Sync & Backup */}
        {activeTab === 'backup' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Permanent Data Storage &amp; Sync</h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Manage browser persistence, push changes to your live Vercel website, and export/import offline backups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Browser Persistence Status */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Browser Persistence: Active</h3>
                    <span className="text-xs text-emerald-700 font-medium font-mono">Protected against Refresh &amp; Page Closes</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Every change you make (photo uploads, project additions, text edits) is automatically saved to your browser&apos;s permanent storage (<span className="font-mono text-emerald-800 font-bold">localStorage</span>) and synced with the local data files. When you refresh the page or return tomorrow, your customized data is immediately restored!
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-mono">
                  ✓ Projects: {data?.projects?.length || 0} saved<br />
                  ✓ Qualifications: {data?.educationList?.length || 0} saved<br />
                  ✓ Profile Name: {data?.profile?.name || 'N/A'}<br />
                  ✓ Photo URL: {data?.profile?.avatar?.substring(0, 32)}...
                </div>
              </div>

              {/* Card 2: Git & Vercel Live Deployment */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Push to Live Website (GitHub &amp; Vercel)</h3>
                    <span className="text-xs text-orange-600 font-medium">1-Click Live Deployment</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Click the button below to commit all your latest changes directly to your GitHub repository (<span className="font-mono text-slate-800 font-semibold">Hanuman76/portfolio</span>). Vercel will immediately build and deploy the changes live for all visitors worldwide!
                </p>
                <button
                  onClick={handleGitSync}
                  disabled={isPushingGit}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/30 transition-all disabled:opacity-50"
                >
                  {isPushingGit ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                  <span>{isPushingGit ? 'Pushing to GitHub...' : 'Deploy to Live Website Now'}</span>
                </button>
                {gitStatusMessage && (
                  <p className="mt-3 text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 font-mono">
                    {gitStatusMessage}
                  </p>
                )}
              </div>

              {/* Card 3: Offline Backup (Export & Import) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Backup &amp; Restore (JSON)</h3>
                    <span className="text-xs text-blue-600 font-medium">Offline Data Safety</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Download a complete backup JSON file containing all your custom texts, projects, photos, and links. You can restore it anytime on any browser or computer.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <input
                    type="file"
                    ref={backupFileInputRef}
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImportBackup(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Restore from Backup</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Factory Reset */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Reset to Defaults</h3>
                    <span className="text-xs text-red-600 font-medium">Clear browser cache &amp; reload default site data</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  If you want to discard your local modifications and revert the site to its original clean template, you can reset below.
                </p>
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-xs transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset to Factory Template</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit / Create Project Modal */}
      {isEditingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            <h3 className="text-xl font-black text-slate-900 mb-4">
              {currentProject.id ? 'Edit GitHub Project' : 'Add New GitHub Project'}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={currentProject.title || ''}
                  onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                  placeholder="e.g. Next.js 3D Portfolio"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={currentProject.description || ''}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, description: e.target.value })
                  }
                  placeholder="Problem solved and features..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-normal focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-900" />
                  <span>GitHub Repository Link</span>
                </label>
                <input
                  type="text"
                  value={currentProject.githubUrl || ''}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/username/project"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="text"
                  value={currentProject.liveUrl || ''}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, liveUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-600" />
                  <span>Languages Used (e.g. Python, PHP, TypeScript)</span>
                </label>
                <input
                  type="text"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  placeholder="Python, PHP, TypeScript"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Frameworks Used (e.g. Next.js, Laravel, Django)</span>
                </label>
                <input
                  type="text"
                  value={frameworkInput}
                  onChange={(e) => setFrameworkInput(e.target.value)}
                  placeholder="Next.js 14, Laravel 11, FastAPI"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-600" />
                    <span>Database Used</span>
                  </label>
                  <input
                    type="text"
                    value={currentProject.database || 'MongoDB'}
                    onChange={(e) =>
                      setCurrentProject({ ...currentProject, database: e.target.value })
                    }
                    placeholder="MySQL, PostgreSQL, MongoDB"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>Project Photo</span>
                    <span className="text-[10px] text-orange-600 font-bold">Folder Upload</span>
                  </label>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 shadow-sm shrink-0">
                      <Image
                        src={currentProject.image || '/project_fbv.jpg'}
                        alt="Project"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => projectFileRef.current?.click()}
                      disabled={uploadingField === 'project'}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-700 font-bold text-xs transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      {uploadingField === 'project' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-3.5 h-3.5 text-orange-600" />
                          <span>ðŸ“ Choose from Folder</span>
                        </>
                      )}
                    </button>

                    <input
                      ref={projectFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file, 'project');
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    value={currentProject.image || ''}
                    onChange={(e) =>
                      setCurrentProject({ ...currentProject, image: e.target.value })
                    }
                    placeholder="/uploads/... or URL"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsEditingProject(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Education Modal */}
      {isEditingEdu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 max-w-lg w-full shadow-2xl text-slate-900">
            <h3 className="text-xl font-black text-slate-900 mb-4">
              Add / Edit Academic Qualification
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  Education Level
                </label>
                <select
                  value={currentEdu.level}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                >
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="12th Standard">12th Standard (Senior Secondary)</option>
                  <option value="10th Standard">10th Standard (High School)</option>
                  <option value="Certification">Professional Certification</option>
                  <option value="Other">Other Qualification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  Degree / Examination Name
                </label>
                <input
                  type="text"
                  value={currentEdu.degree || ''}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Computer Applications (BCA)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  College / School / Institution
                </label>
                <input
                  type="text"
                  value={currentEdu.institution || ''}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                  placeholder="e.g. Apex Institute or Central School"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                    Passing Year / Timeline
                  </label>
                  <input
                    type="text"
                    value={currentEdu.year || ''}
                    onChange={(e) => setCurrentEdu({ ...currentEdu, year: e.target.value })}
                    placeholder="e.g. 2021 - 2024"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                    Score / Grade / Percentage
                  </label>
                  <input
                    type="text"
                    value={currentEdu.score || ''}
                    onChange={(e) => setCurrentEdu({ ...currentEdu, score: e.target.value })}
                    placeholder="e.g. 8.8 CGPA or 86%"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                  Highlights & Courses (One per line)
                </label>
                <textarea
                  rows={3}
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="Data Structures in C++&#10;Database Management&#10;Software Architecture"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-900 text-sm font-normal focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsEditingEdu(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEducation}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all"
              >
                Save Qualification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


