import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Auto-migrate: add 'options' column to DB if not exists
async function ensureOptionsColumn() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb`
    );
  } catch (e) {
    // Column may already exist or DB doesn't support ALTER — safe to ignore
  }
}

export async function GET() {
  await ensureOptionsColumn();
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(Array.isArray(items) ? items : []);
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  await ensureOptionsColumn();
  try {
    const body = await req.json();
    const { name, description, price, imageUrl, categoryId, isAvailable, isRecommended, options } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and categoryId are required.' }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        categoryId,
        isAvailable: isAvailable ?? true,
        isRecommended: isRecommended ?? false,
        options: options ?? [],
      },
      include: { category: true },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
