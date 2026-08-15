import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const safeFileName = fileName || `file-${Date.now()}.jpg`;

    // Try Supabase upload if configured
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanProjectUrl = supabaseUrl.replace(/\/$/, '');
        const uploadUrl = `${cleanProjectUrl}/storage/v1/object/slips/${safeFileName}`;

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': fileType || 'image/jpeg',
            'x-upsert': 'true',
          },
          body: buffer,
        });

        if (response.ok) {
          const publicUrl = `${cleanProjectUrl}/storage/v1/object/public/slips/${safeFileName}`;
          return NextResponse.json({ success: true, url: publicUrl });
        } else {
          const result = await response.json();
          console.warn('Supabase upload returned non-ok status, falling back to local/base64:', result);
        }
      } catch (supabaseErr) {
        console.warn('Supabase upload error, falling back to local file storage:', supabaseErr);
      }
    }

    // Fallback: Save to local public/uploads folder or data URI
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeFileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeFileName}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch (fsErr) {
      console.warn('Local fs write error, returning base64 Data URI:', fsErr);
      const mime = fileType || 'image/jpeg';
      const dataUri = `data:${mime};base64,${base64Data}`;
      return NextResponse.json({ success: true, url: dataUri });
    }
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
