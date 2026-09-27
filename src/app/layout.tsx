import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const inter = localFont({
  src: './fonts/inter-latin-variable.woff2',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Revision OS — Study in the right order',
  description: 'A study roadmap grounded in your course materials and past exams.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={inter.className}>{children}</body></html>;
}
