import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate mime type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimeTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload JPG, PNG, WEBP, GIF, or SVG.' },
        { status: 400 }
      );
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum allowed size is 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || 'image/jpeg';
    const base64Url = `data:${mime};base64,${buffer.toString('base64')}`;

    // Try saving to disk locally if filesystem is writable
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name) || '.jpg';
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `${baseName}_${Date.now()}${ext.toLowerCase()}`;
      const targetFilePath = path.join(uploadDir, safeFilename);

      fs.writeFileSync(targetFilePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeFilename}`,
        filename: safeFilename,
        size: file.size,
      });
    } catch {
      // In serverless / read-only Vercel environment, return base64 Data URL!
      return NextResponse.json({
        success: true,
        url: base64Url,
        filename: file.name,
        size: file.size,
      });
    }
  } catch (error) {
    console.error('Error in file upload API:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
