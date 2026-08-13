import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLineOrderNotification } from '@/lib/line';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Check Store Guard Status
    const storeSetting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (storeSetting && !['OPEN', 'QUEUE_ONLY'].includes(storeSetting.status)) {
      return NextResponse.json(
        { error: storeSetting.closedMessage || 'ขออภัย ร้านค้าปิดให้บริการอยู่ในขณะนี้' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { customerName, customerPhone, items, totalAmount, note, lineUserId, lineAccessToken, slipUrl, paymentMethod } = body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Customer name and valid order items are required.' }, { status: 400 });
    }
    if (typeof lineUserId !== 'string' || !lineUserId.trim()) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ LINE ก่อนสั่งอาหาร' }, { status: 401 });
    }
    if (typeof lineAccessToken !== 'string' || !lineAccessToken) {
      return NextResponse.json({ error: 'ไม่พบสิทธิ์ LINE Login กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }
    const lineProfileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${lineAccessToken}` },
    });
    if (!lineProfileRes.ok) {
      return NextResponse.json({ error: 'LINE Login หมดอายุ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }
    const verifiedLineProfile = await lineProfileRes.json() as { userId?: string };
    if (verifiedLineProfile.userId !== lineUserId) {
      return NextResponse.json({ error: 'ไม่สามารถยืนยันบัญชี LINE ได้' }, { status: 401 });
    }
    if (!Number.isFinite(Number(totalAmount)) || Number(totalAmount) <= 0) {
      return NextResponse.json({ error: 'A valid total amount is required.' }, { status: 400 });
    }
    if (paymentMethod !== 'CASH' && paymentMethod !== 'PROMPTPAY') {
      return NextResponse.json({ error: 'A valid payment method is required.' }, { status: 400 });
    }
    if (paymentMethod === 'PROMPTPAY' && (typeof slipUrl !== 'string' || !slipUrl.startsWith('http'))) {
      return NextResponse.json({ error: 'กรุณาแนบสลิปการโอนเงินก่อนยืนยันคำสั่งซื้อ' }, { status: 400 });
    }

    // 2. Generate Today's Queue Number (e.g. A-001)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const queueSeq = (countToday + 1).toString().padStart(3, '0');
    const queueNumber = `A-${queueSeq}`;

    // 3. Find or Create User if LINE ID provided
    let userId: string | null = null;
    if (lineUserId) {
      const existingUser = await prisma.user.findUnique({
        where: { lineUserId },
      });
      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { displayName: customerName, phone: customerPhone || null },
        });
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            lineUserId,
            displayName: customerName,
            phone: customerPhone,
          },
        });
        userId = newUser.id;
      }
    }

    let initialPaymentStatus = 'UNPAID';
    if (slipUrl && slipUrl.startsWith('http')) {
      initialPaymentStatus = 'VERIFYING';
    }

    // 4. Create Order & Items
    const order = await prisma.order.create({
      data: {
        queueNumber,
        userId,
        customerName,
        customerPhone: customerPhone || '',
        totalAmount: parseFloat(totalAmount),
        note: note || '',
        paymentStatus: initialPaymentStatus,
        slipUrl: slipUrl || null,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            itemName: item.itemName,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
            specialRequest: item.specialRequest || '',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 5. Send automated LINE Official Account Notification if lineUserId exists
    if (lineUserId) {
      const orderPath = `/order/${order.id}`;
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      const trackerUrl = liffId
        ? `https://liff.line.me/${liffId}${orderPath}`
        : new URL(orderPath, req.url).toString();
      await sendLineOrderNotification(lineUserId, {
        queueNumber: order.queueNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        items: order.items,
        paymentStatus: order.paymentStatus,
        trackerUrl,
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
