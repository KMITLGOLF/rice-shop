import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured in environment variables' },
        { status: 500 }
      );
    }

    // Clean base64 string
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanProjectUrl = supabaseUrl.replace(/\/$/, '');
    const uploadUrl = `${cleanProjectUrl}/storage/v1/object/slips/${fileName}`;

    // Upload directly to Supabase Storage REST API
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

    const result = await response.json();

    if (!response.ok) {
      console.error('Supabase upload error:', result);
      return NextResponse.json({ error: 'Failed to upload to Supabase', details: result }, { status: 500 });
    }

    // Construct the public URL of the uploaded image
    const publicUrl = `${cleanProjectUrl}/storage/v1/object/public/slips/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
