import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ashiato Memo',
  description: 'Outing records app for parents and children',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
