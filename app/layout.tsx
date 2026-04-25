import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets:['latin'], variable:'--font-geist-sans', display:'swap' });
const mono = JetBrains_Mono({ subsets:['latin'], variable:'--font-geist-mono', display:'swap' });

export const metadata: Metadata = {
  title: { default:'DNA Analyzer — Decode Your Codebase', template:'%s | DNA Analyzer' },
  description: 'Deep analysis of any GitHub repository — complexity, commit patterns, risk areas, developer insights, and an A–F health grade.',
  keywords: ['github','code analysis','repository health','technical debt','developer analytics'],
};
export const viewport: Viewport = { themeColor:'#0A0B10', colorScheme:'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton theme="dark" toastOptions={{ style:{ background:'hsl(224 15% 9%)', border:'1px solid hsl(215 20% 16%)', color:'hsl(213 31% 91%)' } }} />
      </body>
    </html>
  );
}
