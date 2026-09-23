import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPortfolioData, savePortfolioData } from '@/lib/portfolioStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = getPortfolioData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const data = getPortfolioData();

    if (body.profile) {
      data.profile = { ...data.profile, ...body.profile };
    }
    if (body.educationList) {
      data.educationList = body.educationList;
    }
    if (body.skills) {
      data.skills = body.skills;
    }

    savePortfolioData(data);

    // Purge caches immediately so changes reflect on live site
    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (e) {
      console.warn('Revalidate error:', e);
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to update portfolio data' }, { status: 500 });
  }
}
