# CLAUDE.md - Ashiato Memo Web App

このファイルは、Claude（AIコーディングアシスタント）がこのプロジェクトを理解するためのコンテキスト情報です。

## プロジェクト概要

**Ashiato Memo Web App**は、子どもとのお出かけ記録に特化したWebアプリケーション。iOS版AshiatoMemoAppと同じ機能をFirebase連携で実装。

- **目的**: お出かけ先の記録を構造化して保存・管理
- **ターゲット**: 子育て中の親
- **特徴**: ページング型エディタ、テンプレート機能、タグシステム

## 技術スタック

### フロントエンド
- **Next.js 16.1.1** (App Router)
- **React 19** + TypeScript
- **TailwindCSS v4** (`@tailwindcss/postcss`)
- **next-intl v4** (多言語対応: ja/en/zh)

### バックエンド
- **Firebase**
  - Authentication (Google Sign-In)
  - Firestore (NoSQL Database)
  - Storage (画像用、未実装)
  - Hosting

### 重要な依存関係
- `next-intl` - 多言語対応
- `firebase` - Firebase SDK
- `uuid` - ユニークID生成

## プロジェクト構造

```
ashiato-memo-web/
├── app/[locale]/          # 多言語ルーティング
│   ├── page.tsx          # ログイン画面
│   ├── memos/
│   │   ├── page.tsx      # メモ一覧
│   │   └── create/       # メモ作成フロー
│   │       ├── page.tsx           # タイプ・モード選択
│   │       ├── editor/page.tsx    # ページング型エディタ
│   │       └── review/page.tsx    # レビュー・保存
├── lib/
│   ├── firebase.ts       # Firebase初期化
│   ├── auth-context.tsx  # 認証コンテキスト
│   └── firestore.ts      # Firestore CRUD操作
├── messages/             # 多言語翻訳ファイル (ja/en/zh)
├── types/index.ts        # TypeScript型定義
├── i18n.ts              # next-intl設定
├── routing.ts           # ルーティング設定
└── middleware.ts        # next-intl middleware

```

## 重要な設計決定

### 1. Next.js 15+ 対応
- `params` が Promise になったため、すべて `await` で展開
- `app/[locale]/layout.tsx`: `params: Promise<{ locale: string }>`

### 2. TailwindCSS v4
- PostCSSプラグインが `@tailwindcss/postcss` に変更
- `globals.css` で `@import "tailwindcss";` を使用
- `tailwind.config.ts` は不要（削除済み）

### 3. next-intl v3+ 設定
- `routing.ts` でロケール設定を一元管理
- `i18n.ts` で `requestLocale` を使用（Next.js 15+対応）
- `middleware.ts` で routing をインポート

### 4. Firestore データモデル

**memos コレクション:**
```typescript
{
  id: string (自動生成)
  userId: string
  title: string
  blocks: MemoBlock[]
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

**MemoBlock:**
```typescript
{
  id: string
  type: 'text' | 'image'
  text?: string
  imageUrl?: string
  categoryName: string
  tags: string[]
  order: number
}
```

### 5. セキュリティルール

Firestoreルール:
```javascript
match /memos/{memoId} {
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid;
  allow read, update, delete: if request.auth != null &&
                                 resource.data.userId == request.auth.uid;
}
```

## 既知の問題と回避策

### 1. Firestore 複合インデックス
**問題**: `getUserMemos` で userId + createdAt のクエリにインデックスが必要

**解決策**: エラーメッセージのリンクから Firebase Console でインデックスを作成

### 2. フォーム入力の文字色
**問題**: ダークモードで入力テキストが見えない

**解決策**: `globals.css` で `input, textarea { color: #000000 !important; }` を追加済み

### 3. middleware 警告 (Next.js 16)
**警告**: "middleware" is deprecated, use "proxy" instead

**現状**: next-intl が対応するまで警告を無視（動作に影響なし）

## 環境変数

`.env.local` に以下を設定:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 実装済み機能 (MVP)

- ✅ Google Sign-In 認証
- ✅ メモ作成（ページング型エディタ）
- ✅ メモ一覧表示
- ✅ メモ削除
- ✅ 検索機能（タイトル・本文・タグ）
- ✅ タグフィルタリング
- ✅ 多言語対応（ja/en/zh）
- ✅ レスポンシブデザイン

## 未実装機能

### 優先度A
1. **メモ詳細表示ページ** - `app/[locale]/memos/[id]/page.tsx`
2. **メモ編集機能** - `app/[locale]/memos/[id]/edit/page.tsx`
3. **分析ダッシュボード** - `app/[locale]/analysis/page.tsx`
   - バックエンド関数は実装済み (`getMemoStats`)

### 優先度B
4. **画像アップロード機能** - Firebase Storage 連携
5. **設定画面** - 言語選択UI

### 優先度C
6. メモ共有機能
7. エクスポート機能（PDF/CSV）
8. PWA対応

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
```

## Firebase セットアップ

1. Authentication > Google Sign-In を有効化
2. Firestore Database を作成（asia-northeast1）
3. Firestore セキュリティルールを設定
4. 必要に応じて複合インデックスを作成

## iOS版との違い

| 項目 | iOS版 | Web版 |
|------|-------|-------|
| データ保存 | SwiftData（ローカル） | Firestore（クラウド） |
| 認証 | なし | Google Sign-In |
| 画像 | URL表示のみ | 未実装 |
| 分析 | あり | 未実装 |

## 注意事項

1. **Next.js 16 使用時**: `params` は必ず `await` する
2. **Firestore クエリ**: 複数フィールドのクエリは複合インデックスが必要
3. **多言語**: メッセージは `messages/` ディレクトリの JSON ファイルで管理
4. **認証**: すべてのページで `useAuth()` を使用してユーザー状態を確認

## 参考リンク

- [Next.js 16 ドキュメント](https://nextjs.org/docs)
- [next-intl ドキュメント](https://next-intl.dev/)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [TailwindCSS v4](https://tailwindcss.com/docs)

---

最終更新: 2026-01-06
