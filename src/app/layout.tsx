import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RevisionOS — Study in the right order',
  description: 'A study roadmap grounded in your course materials and past exams.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
