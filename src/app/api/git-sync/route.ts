import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST() {
  // If running on Vercel serverless environment, local git command is unavailable
  if (process.env.VERCEL === '1') {
    return NextResponse.json({
      success: false,
      isServerless: true,
      message: 'Running on Vercel cloud serverless. Data is safely saved in your browser and cloud memory.',
    });
  }

  try {
    const cwd = process.cwd();
    const gitDir = path.join(cwd, '.git');
    if (!fs.existsSync(gitDir)) {
      return NextResponse.json({
        success: false,
        message: 'No local .git directory found to push from.',
      });
    }

    // Git add data file and any uploads
    await execPromise('git add src/data/portfolio-data.json public/uploads', { cwd });

    // Commit changes
    try {
      await execPromise('git commit -m "chore(data): auto-update portfolio content from admin panel"', { cwd });
    } catch {
      // If nothing new to commit, proceed to push
    }

    // Push to GitHub origin main
    const { stdout, stderr } = await execPromise('git push origin main', { cwd });

    return NextResponse.json({
      success: true,
      message: 'Successfully committed and pushed latest changes to GitHub! Vercel is now deploying your updates live.',
      output: stdout || stderr,
    });
  } catch (error: any) {
    console.error('Git sync error:', error);
    return NextResponse.json({
      success: false,
      message: error?.message || 'Git sync failed',
    }, { status: 500 });
  }
}