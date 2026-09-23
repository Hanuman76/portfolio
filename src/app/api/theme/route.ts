import { NextResponse } from 'next/server';
import { getPortfolioData, savePortfolioData } from '@/lib/portfolioStore';

export async function GET() {
  try {
    const data = getPortfolioData();
    return NextResponse.json(data.theme);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = getPortfolioData();

    data.theme = {
      ...data.theme,
      bgColor: body.bgColor ?? data.theme.bgColor,
      accentColor: body.accentColor ?? data.theme.accentColor,
      textColor: body.textColor ?? data.theme.textColor,
      glowColor: body.glowColor ?? data.theme.glowColor,
      preset: body.preset ?? data.theme.preset,
    };

    savePortfolioData(data);
    return NextResponse.json({ success: true, theme: data.theme });
  } catch {
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}
