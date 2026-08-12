import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const defaultStoreSetting = {
  id: 'default',
  storeName: "ร้านข้าวคุณแม่ (Mom's Rice Kitchen)",
  status: 'OPEN',
  closedMessage: 'ขออภัย วันนี้ร้านปิดให้บริการ จะกลับมาเปิดใหม่อีกครั้งพรุ่งนี้ครับ',
  promptpayId: '0812345678',
  promptpayName: 'ร้านข้าวคุณแม่',
};

export async function GET() {
  try {
    let storeSetting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (!storeSetting) {
      return NextResponse.json(defaultStoreSetting);
    }

    return NextResponse.json(storeSetting);
  } catch (error) {
    console.error('Database connection warning (Serverless Mode):', error);
    // Return fallback settings for cloud/serverless hosting
    return NextResponse.json(defaultStoreSetting);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { status, closedMessage, promptpayId, promptpayName, storeName } = body;

    const updated = await prisma.storeSetting.upsert({
      where: { id: 'default' },
      update: {
        ...(status && { status }),
        ...(closedMessage !== undefined && { closedMessage }),
        ...(promptpayId && { promptpayId }),
        ...(promptpayName && { promptpayName }),
        ...(storeName && { storeName }),
      },
      create: {
        id: 'default',
        storeName: storeName || "ร้านข้าวคุณแม่ (Mom's Rice Kitchen)",
        status: status || 'OPEN',
        closedMessage: closedMessage || 'ขออภัย วันนี้ร้านปิดให้บริการ',
        promptpayId: promptpayId || '0812345678',
        promptpayName: promptpayName || 'ร้านข้าวคุณแม่',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update store settings:', error);
    return NextResponse.json(defaultStoreSetting);
  }
}
