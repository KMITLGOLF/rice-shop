import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const defaultCategories = [
  { id: 'cat-1', name: 'อาหารจานเดียว (Rice Dishes)', sortOrder: 1 },
  { id: 'cat-2', name: 'เมนูก๋วยเตี๋ยว & เส้น (Noodles)', sortOrder: 2 },
  { id: 'cat-3', name: 'เครื่องดื่ม (Drinks & Beverages)', sortOrder: 3 },
  { id: 'cat-4', name: 'ของหวาน (Desserts)', sortOrder: 4 },
];

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    if (!categories || categories.length === 0) {
      return NextResponse.json(defaultCategories);
    }
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Database query fallback (Serverless Mode):', error);
    return NextResponse.json(defaultCategories);
  }
}
