import type { Metadata } from 'next';
import './globals.css';
import { LiffProvider } from '@/components/Customer/LiffProvider';

export const metadata: Metadata = {
  title: "ร้านข้าวคุณแม่ - สั่งอาหารออนไลน์ & PromptPay QR",
  description: "ระบบสั่งอาหารออนไลน์ผ่าน LINE LIFF พร้อมชำระเงิน PromptPay QR Code และติดตามคิว realtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
