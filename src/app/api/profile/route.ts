import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function verifyLineUser(lineUserId: string, accessToken: string | null) {
  if (!accessToken) return false;
  const response = await fetch('https://api.line.me/v2/profile', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return false;
  return (await response.json() as { userId?: string }).userId === lineUserId;
}

export async function GET(req: Request) {
  const lineUserId = new URL(req.url).searchParams.get('lineUserId');
  if (!lineUserId) return NextResponse.json({ error: 'LINE user ID is required' }, { status: 400 });
  if (!await verifyLineUser(lineUserId, req.headers.get('authorization')?.replace('Bearer ', '') || null)) {
    return NextResponse.json({ error: 'LINE Login is required' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { lineUserId } });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  try {
    const { lineUserId, displayName, phone, pictureUrl } = await req.json();
    if (!lineUserId || !displayName?.trim()) {
      return NextResponse.json({ error: 'LINE user ID and display name are required' }, { status: 400 });
    }
    if (!await verifyLineUser(lineUserId, req.headers.get('authorization')?.replace('Bearer ', '') || null)) {
      return NextResponse.json({ error: 'LINE Login is required' }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { lineUserId },
      update: { displayName: displayName.trim(), phone: phone?.trim() || null, ...(pictureUrl && { pictureUrl }) },
      create: { lineUserId, displayName: displayName.trim(), phone: phone?.trim() || null, pictureUrl: pictureUrl || null },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update customer profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
