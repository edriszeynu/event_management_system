import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/common/Header';
import { ToastProvider } from '@/components/ui/toast-provider';

export const metadata: Metadata = {
  title: 'EventHub',
  description: 'Discover, connect, and experience the best events in your city.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <Header />
            <main>{children}</main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
