import type { Metadata, Viewport } from 'next';
import './globals.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ashiato-memo.web.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '足跡メモ - 子どもとのお出かけ記録アプリ | Ashiato Memo',
    template: '%s | 足跡メモ',
  },
  description:
    '足跡メモは、子どもとのお出かけを簡単に記録・管理できるアプリです。施設情報、持ち物、感想をカテゴリ別に整理。家族の思い出を振り返りやすく保存できます。',
  keywords: [
    '子ども',
    'お出かけ',
    '記録',
    'アプリ',
    '育児',
    '子育て',
    '家族',
    'おでかけ',
    'レジャー',
    '施設',
    'レビュー',
    '思い出',
    'メモ',
    '足跡',
  ],
  authors: [{ name: 'Ashiato Memo Team' }],
  creator: 'Ashiato Memo',
  publisher: 'Ashiato Memo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'zh_CN'],
    url: baseUrl,
    siteName: '足跡メモ | Ashiato Memo',
    title: '足跡メモ - 子どもとのお出かけ記録アプリ',
    description:
      '子どもとのお出かけを簡単に記録・管理。施設情報、持ち物、感想をカテゴリ別に整理できるアプリです。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '足跡メモ - 子どもとのお出かけ記録アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '足跡メモ - 子どもとのお出かけ記録アプリ',
    description:
      '子どもとのお出かけを簡単に記録・管理。施設情報、持ち物、感想をカテゴリ別に整理できるアプリです。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'ja': baseUrl,
      'en': `${baseUrl}/en`,
      'zh': `${baseUrl}/zh`,
    },
  },
  category: 'lifestyle',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
