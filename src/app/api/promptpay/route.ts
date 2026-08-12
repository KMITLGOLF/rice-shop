import { NextResponse } from 'next/server';
import { generatePromptPayQRDataUrl } from '@/lib/promptpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, promptpayId: customId } = body;

    let targetId = customId;

    if (!targetId) {
      const storeSetting = await prisma.storeSetting.findUnique({
        where: { id: 'default' },
      });
      targetId = storeSetting?.promptpayId || process.env.PROMPTPAY_ID || '0812345678';
    }

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Valid total amount is required' }, { status: 400 });
    }

    const qrDataUrl = await generatePromptPayQRDataUrl(targetId, parseFloat(amount));

    return NextResponse.json({
      success: true,
      qrDataUrl,
      promptpayId: targetId,
      amount: parseFloat(amount),
    });
  } catch (error) {
    console.error('Failed to generate PromptPay QR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
