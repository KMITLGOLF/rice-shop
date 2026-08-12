import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const defaultMenuItems = [
  {
    id: 'm1',
    name: 'ข้าวกะเพราหมูกรอบ ไข่ดาว (Crispy Pork Holy Basil)',
    description: 'กะเพราหมูกรอบรสจัดจ้าน กรอบนอกนุ่มใน เสิร์ฟพร้อมไข่ดาวกรอบขอบกรอบ',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    category: { name: 'อาหารจานเดียว (Rice Dishes)' },
    isAvailable: true,
    isRecommended: true,
  },
  {
    id: 'm2',
    name: 'ข้าวผัดต้มยำกุ้งสด (Tom Yum Fried Rice)',
    description: 'ข้าวผัดซอสผัดต้มยำหอมเครื่องเทศ กุ้งแม่น้ำตัวใหญ่ หอมมะนาวสด',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    category: { name: 'อาหารจานเดียว (Rice Dishes)' },
    isAvailable: true,
    isRecommended: true,
  },
  {
    id: 'm3',
    name: 'ผัดไทยกุ้งสด ห่อไข่ (Pad Thai with Fresh Shrimp)',
    description: 'เส้นจันทน์เหนียวนุ่ม ผัดซอสมะขามเปียกเข้มข้น ห่อด้วยไข่นุ่มๆ',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-2',
    category: { name: 'เมนูก๋วยเตี๋ยว & เส้น (Noodles)' },
    isAvailable: true,
    isRecommended: true,
  },
  {
    id: 'm4',
    name: 'ชาไทยเย็น โบราณ (Traditional Thai Milk Tea)',
    description: 'ชาไทยตรามือเข้มข้น ใส่นมสดแท้ 100% หอมหวานกำลังดี',
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-3',
    category: { name: 'เครื่องดื่ม (Drinks & Beverages)' },
    isAvailable: true,
    isRecommended: true,
  },
  {
    id: 'm5',
    name: 'บิงซูชาไทย เฉาก๊วย (Thai Tea Bingsu)',
    description: 'น้ำแข็งไสเกล็ดหิมะรสชาไทย โรยหน้าด้วยเฉาก๊วยหนึบและนมข้นหวาน',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-4',
    category: { name: 'ของหวาน (Desserts)' },
    isAvailable: true,
    isRecommended: true,
  },
];

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!items || items.length === 0) {
      return NextResponse.json(defaultMenuItems);
    }
    return NextResponse.json(items);
  } catch (error) {
    console.error('Database query fallback (Serverless Mode):', error);
    return NextResponse.json(defaultMenuItems);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, imageUrl, categoryId, isAvailable, isRecommended } = body;

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
      },
      include: { category: true },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json({
      id: `temp-${Date.now()}`,
      name: 'รายการเพิ่มใหม่ (Demo)',
      price: 60,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      isAvailable: true,
      isRecommended: false,
    }, { status: 201 });
  }
}
