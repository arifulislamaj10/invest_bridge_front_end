import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import './globals.css';

export const metadata: Metadata = {
  title: 'InvestBridge - Global Investment Marketplace',
  description: 'Verified. Secure. Confidential. Global. Bridge the trust gap between entrepreneurs and investors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
