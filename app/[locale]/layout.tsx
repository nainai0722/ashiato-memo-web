import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/lib/auth-context';
import { routing } from '@/routing';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ashiato-memo.web.app';

const localeMetadata: Record<string, { title: string; description: string }> = {
  ja: {
    title: '足跡メモ - 子どもとのお出かけ記録アプリ',
    description:
      '足跡メモは、子どもとのお出かけを簡単に記録・管理できるアプリです。施設情報、持ち物、感想をカテゴリ別に整理。家族の思い出を振り返りやすく保存できます。',
  },
  en: {
    title: 'Ashiato Memo - Family Outing Records App',
    description:
      'Ashiato Memo helps you easily record and manage family outings with children. Organize facility info, essentials, and memories by category.',
  },
  zh: {
    title: '足迹备忘录 - 亲子出行记录应用',
    description:
      '足迹备忘录帮助您轻松记录和管理与孩子的出行。按类别整理设施信息、必需品和回忆。',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale] || localeMetadata.ja;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: locale === routing.defaultLocale ? baseUrl : `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          l === routing.defaultLocale ? baseUrl : `${baseUrl}/${l}`,
        ])
      ),
    },
  };
}

function getStructuredData(locale: string) {
  const meta = localeMetadata[locale] || localeMetadata.ja;

  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: locale === 'ja' ? '足跡メモ' : locale === 'zh' ? '足迹备忘录' : 'Ashiato Memo',
    description: meta.description,
    url: locale === routing.defaultLocale ? baseUrl : `${baseUrl}/${locale}`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    author: {
      '@type': 'Organization',
      name: 'Ashiato Memo Team',
    },
    inLanguage: locale,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: locale === 'ja'
      ? [
          {
            '@type': 'Question',
            name: '足跡メモはどのようなアプリですか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '足跡メモは、子どもとのお出かけ記録に特化したアプリです。施設の概要、トイレ情報、持ち物、感想などをカテゴリ別に整理して保存できます。',
            },
          },
          {
            '@type': 'Question',
            name: '無料で使えますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'はい、足跡メモは無料でお使いいただけます。Googleアカウントでログインするだけですぐに始められます。',
            },
          },
          {
            '@type': 'Question',
            name: '記録した内容は他の人に公開されますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '記録は基本的に非公開です。公開設定をオンにした記録のみ「みんなの記録」として他のユーザーに共有されます。',
            },
          },
          {
            '@type': 'Question',
            name: 'どのようなデバイスで使えますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'スマートフォン、タブレット、パソコンなど、モダンブラウザが使えるすべてのデバイスでご利用いただけます。',
            },
          },
        ]
      : locale === 'en'
        ? [
            {
              '@type': 'Question',
              name: 'What is Ashiato Memo?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ashiato Memo is an app specialized for recording family outings with children. You can organize and save facility information, toilets, essentials, and impressions by category.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is it free to use?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, Ashiato Memo is free to use. Simply sign in with your Google account to get started.',
              },
            },
          ]
        : [
            {
              '@type': 'Question',
              name: '足迹备忘录是什么应用？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '足迹备忘录是专门用于记录与孩子外出的应用程序。您可以按类别整理和保存设施信息、洗手间、必需品和感想。',
              },
            },
            {
              '@type': 'Question',
              name: '可以免费使用吗？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '是的，足迹备忘录可以免费使用。只需使用Google账户登录即可开始使用。',
              },
            },
          ],
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ashiato Memo',
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
  };

  return [webApplication, faqPage, organization];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await getMessages();
  const structuredData = getStructuredData(locale);

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
