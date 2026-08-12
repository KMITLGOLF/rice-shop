import QRCode from 'qrcode';
import generatePayload from 'promptpay-qr';

/**
 * Standard EMVCo PromptPay Dynamic Payload Generator
 * @param promptpayId - Phone number (e.g. 0812345678) or National ID / Tax ID
 * @param amount - Exact order total in THB (e.g. 150.00)
 */
export function createPromptPayPayload(promptpayId: string, amount?: number): string {
  try {
    const formattedId = promptpayId.replace(/[^0-9]/g, '');
    return generatePayload(formattedId, { amount });
  } catch (error) {
    console.error('Error generating PromptPay payload:', error);
    // Standalone fallback EMVCo promptpay string formatter
    const id = promptpayId.replace(/[^0-9]/g, '');
    const isMobile = id.length === 10;
    const target = isMobile ? `00066${id.substring(1)}` : id;
    const targetTag = isMobile ? '01' : '02';
    
    let payload = '00020101021229370016A000000677010111';
    payload += `${targetTag}${target.length.toString().padStart(2, '0')}${target}`;
    payload += '5303764'; // THB currency
    
    if (amount && amount > 0) {
      const amtStr = amount.toFixed(2);
      payload += `54${amtStr.length.toString().padStart(2, '0')}${amtStr}`;
    }
    payload += '5802TH6304';
    
    // Add CRC16
    const crc = crc16(payload);
    return payload + crc;
  }
}

/**
 * Generate Base64 Data URL for PromptPay QR Code
 */
export async function generatePromptPayQRDataUrl(promptpayId: string, amount: number): Promise<string> {
  const payload = createPromptPayPayload(promptpayId, amount);
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#002d62', // PromptPay dark navy blue theme
      light: '#ffffff',
    },
    width: 320,
  });
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
