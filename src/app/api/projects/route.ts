import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPortfolioData, savePortfolioData, Project } from '@/lib/portfolioStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = getPortfolioData();
    return NextResponse.json(data.projects, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = getPortfolioData();

    const parseList = (val: any): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: body.title || 'Untitled Project',
      description: body.description || '',
      liveUrl: body.liveUrl || '',
      githubUrl: body.githubUrl || '',
      image: body.image || '/avatar_3d.jpg',
      languages: parseList(body.languages),
      frameworks: parseList(body.frameworks),
      database: body.database || 'MongoDB',
      tags: parseList(body.tags),
      featured: body.featured ?? true,
    };

    data.projects.unshift(newProject);
    savePortfolioData(data);

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/projects error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const data = getPortfolioData();
    const index = data.projects.findIndex((p) => p.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const parseList = (val: any, fallback: string[]): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return fallback;
    };

    data.projects[index] = {
      ...data.projects[index],
      title: body.title ?? data.projects[index].title,
      description: body.description ?? data.projects[index].description,
      liveUrl: body.liveUrl ?? data.projects[index].liveUrl,
      githubUrl: body.githubUrl ?? data.projects[index].githubUrl,
      image: body.image ?? data.projects[index].image,
      languages: parseList(body.languages, data.projects[index].languages || []),
      frameworks: parseList(body.frameworks, data.projects[index].frameworks || []),
      database: body.database ?? data.projects[index].database ?? 'MongoDB',
      tags: parseList(body.tags, data.projects[index].tags || []),
      featured: body.featured ?? data.projects[index].featured,
    };

    savePortfolioData(data);

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, project: data.projects[index] });
  } catch (err: any) {
    console.error('PUT /api/projects error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const data = getPortfolioData();
    const initialLength = data.projects.length;
    data.projects = data.projects.filter((p) => p.id !== id);

    if (data.projects.length === initialLength) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    savePortfolioData(data);

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/projects error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete project' }, { status: 500 });
  }
}
