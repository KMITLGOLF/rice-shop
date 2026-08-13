/**
 * LINE Messaging API helper for pushing order confirmations & queue updates to customers
 */

interface OrderDetails {
  queueNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ itemName: string; quantity: number; price: number }>;
  paymentStatus: string;
  trackerUrl: string;
}

type StoreStatus = 'OPEN' | 'CLOSED' | 'HOLIDAY' | 'QUEUE_ONLY';

export async function sendLineStoreStatusNotification(status: StoreStatus, message?: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const statusText = status === 'OPEN' ? 'ร้านเปิดให้บริการแล้ว' : status === 'QUEUE_ONLY' ? 'ร้านเปิดรับจองคิว/สั่งล่วงหน้า' : status === 'HOLIDAY' ? 'ร้านหยุดให้บริการวันนี้' : 'ร้านปิดให้บริการชั่วคราว';
  const text = `${statusText}${message ? `\n${message}` : ''}`;

  if (!token || token === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
    console.log(`[LINE OA Store Status Simulator] ${text}`);
    return { success: true };
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: [{ type: 'text', text }] }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    return { success: true };
  } catch (error) {
    console.error('Failed to send LINE store-status notification:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendLineOrderStatusNotification(
  lineUserId: string,
  details: { queueNumber: string; status: string; trackerUrl: string }
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const statusText: Record<string, string> = {
    PENDING: 'ร้านรับออเดอร์ของคุณแล้ว',
    PREPARING: 'ร้านกำลังเตรียมอาหารของคุณ',
    READY: 'อาหารของคุณพร้อมรับแล้ว',
    COMPLETED: 'คำสั่งซื้อเสร็จสิ้นแล้ว',
    CANCELLED: 'คำสั่งซื้อของคุณถูกยกเลิก',
  };
  const text = `${statusText[details.status] || 'สถานะคำสั่งซื้อมีการเปลี่ยนแปลง'}\nคิว ${details.queueNumber}`;

  if (!token || token === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
    console.log(`[LINE OA Queue Update Simulator] ${text}: ${details.trackerUrl}`);
    return { success: true };
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{ type: 'flex', altText: text, contents: { type: 'bubble', body: { type: 'box', layout: 'vertical', contents: [
          { type: 'text', text: 'อัปเดตสถานะคำสั่งซื้อ', weight: 'bold', size: 'sm', color: '#EA580C' },
          { type: 'text', text, weight: 'bold', size: 'lg', wrap: true, margin: 'md' },
          { type: 'button', action: { type: 'uri', label: 'ดู Live Tracker', uri: details.trackerUrl }, style: 'primary', color: '#EA580C', margin: 'lg' },
        ] } } }],
      }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    return { success: true };
  } catch (error) {
    console.error('Failed to send LINE order-status notification:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendLineOrderNotification(
  lineUserId: string,
  orderDetails: OrderDetails
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  // Log notification to console if LINE token is not set (Local Development Mode)
  if (!token || token === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
    console.log(`[LINE OA Notification Simulator] Pushed to User ID: ${lineUserId}`);
    console.log(`[Queue ${orderDetails.queueNumber}] Total: ฿${orderDetails.totalAmount}`);
    return { success: true };
  }

  const flexMessage = {
    type: 'flex',
    altText: `ยืนยันคำสั่งซื้อ คิวที่ ${orderDetails.queueNumber}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#ea580c',
        contents: [
          {
            type: 'text',
            text: 'ร้านข้าวคุณแม่',
            color: '#FFFFFF',
            weight: 'bold',
            size: 'sm',
          },
          {
            type: 'text',
            text: `คิวของคุณ: ${orderDetails.queueNumber}`,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'xxl',
            margin: 'md',
          },
          {
            type: 'text',
            text: 'รับรายการสั่งซื้อเรียบร้อยแล้ว',
            color: '#FFEDD5',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `คุณ ${orderDetails.customerName}`,
            weight: 'bold',
            size: 'md',
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: orderDetails.items.map((item) => ({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: `${item.itemName} x${item.quantity}`,
                  size: 'sm',
                  color: '#555555',
                  flex: 4,
                },
                {
                  type: 'text',
                  text: `฿${item.price * item.quantity}`,
                  size: 'sm',
                  color: '#111111',
                  align: 'end',
                  flex: 2,
                },
              ],
            })),
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: 'ราคารวมทั้งสิ้น',
                weight: 'bold',
                size: 'md',
              },
              {
                type: 'text',
                text: `฿${orderDetails.totalAmount.toFixed(2)}`,
                weight: 'bold',
                size: 'xl',
                color: '#ea580c',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: 'สถานะการชำระเงิน',
                size: 'xs',
                color: '#888888',
              },
              {
                type: 'text',
                text: orderDetails.paymentStatus === 'PAID' ? 'ชำระเงินเสร็จสิ้น ✓' : 'รอการตรวจสอบ',
                size: 'xs',
                color: orderDetails.paymentStatus === 'PAID' ? '#16a34a' : '#ea580c',
                align: 'end',
                weight: 'bold',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            action: { type: 'uri', label: 'ติดตามคิวของฉัน', uri: orderDetails.trackerUrl },
            style: 'primary',
            color: '#EA580C',
          },
        ],
      },
    },
  };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [flexMessage],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('LINE Push API error:', err);
      return { success: false, error: JSON.stringify(err) };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send LINE notification:', error);
    return { success: false, error: String(error) };
  }
}
