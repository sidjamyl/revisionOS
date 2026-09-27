import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '700', '800'], display: 'swap' });

export const metadata: Metadata = {
  title: 'RevisionOS — Study in the right order',
  description: 'A study roadmap grounded in your course materials and past exams.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={jakarta.className}>{children}</body></html>;
}
