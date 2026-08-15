import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description, price, imageUrl, categoryId, isAvailable, isRecommended } = body;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isRecommended !== undefined && { isRecommended }),
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

// IDs of hardcoded default/fallback menu items (not in DB)
const DEFAULT_ITEM_IDS = new Set([
  'spaghetti-kee-mao',
  'spaghetti-chili-garlic',
  'spaghetti-kra-pao',
  'spaghetti-carbonara',
  'm1', 'm2', 'm3', 'm4', 'm5',
]);

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Default items live only in fallback data — no DB row to delete
  if (DEFAULT_ITEM_IDS.has(id)) {
    return NextResponse.json({ success: true, note: 'default-item' });
  }

  try {
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // P2025 = record not found in DB either
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: true, note: 'not-found' });
    }
    console.error('Failed to delete menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { isAvailable } = body;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to toggle stock availability:', error);
    return NextResponse.json({ error: 'Failed to toggle availability' }, { status: 500 });
  }
}
