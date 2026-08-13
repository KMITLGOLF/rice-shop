import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const accessToken = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) return NextResponse.json({ error: 'LINE Login is required' }, { status: 401 });
  try {
    const lineResponse = await fetch('https://api.line.me/v2/profile', { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!lineResponse.ok) return NextResponse.json({ error: 'LINE Login has expired' }, { status: 401 });
    const { userId } = await lineResponse.json() as { userId?: string };
    if (!userId) return NextResponse.json({ error: 'Unable to identify LINE user' }, { status: 401 });
    const orders = await prisma.order.findMany({
      where: { user: { lineUserId: userId } }, include: { items: true }, orderBy: { createdAt: 'desc' }, take: 20,
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch customer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
