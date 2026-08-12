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

    if (storeSetting && storeSetting.status !== 'OPEN') {
      return NextResponse.json(
        { error: storeSetting.closedMessage || 'ขออภัย ร้านค้าปิดให้บริการอยู่ในขณะนี้' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { customerName, customerPhone, items, totalAmount, note, lineUserId, slipUrl } = body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Customer name and valid order items are required.' }, { status: 400 });
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

    // 4. Create Order & Items
    const order = await prisma.order.create({
      data: {
        queueNumber,
        userId,
        customerName,
        customerPhone: customerPhone || '',
        totalAmount: parseFloat(totalAmount),
        note: note || '',
        paymentStatus: slipUrl ? 'VERIFYING' : 'PAID', // Slip uploaded or immediate payment
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
      await sendLineOrderNotification(lineUserId, {
        queueNumber: order.queueNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        items: order.items,
        paymentStatus: order.paymentStatus,
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
