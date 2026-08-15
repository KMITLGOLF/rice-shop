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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.menuItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // P2025 = record not found (default/fallback items not in DB)
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: true, note: 'Item was a default item, removed from view' });
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
