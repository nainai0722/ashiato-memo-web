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
  - Storage (画像アップロード)
  - Hosting

### 重要な依存関係
- `next-intl` - 多言語対応
- `firebase` - Firebase SDK
- `uuid` - ユニークID生成
- `jspdf` + `html2canvas` - PDF/CSVエクスポート

## プロジェクト構造

```
ashiato-memo-web/
├── app/[locale]/          # 多言語ルーティング
│   ├── page.tsx          # ログイン画面
│   ├── memos/
│   │   ├── page.tsx      # メモ一覧（My/Public タブ）
│   │   ├── [id]/
│   │   │   ├── page.tsx  # メモ詳細（エクスポート付き）
│   │   │   └── edit/page.tsx  # メモ編集
│   │   └── create/       # メモ作成フロー
│   │       ├── page.tsx           # タイプ・モード選択
│   │       ├── editor/page.tsx    # ページング型エディタ
│   │       └── review/page.tsx    # レビュー・保存
│   ├── analysis/page.tsx  # 分析ダッシュボード
│   └── settings/
│       ├── page.tsx       # 設定画面
│       └── about/page.tsx # Aboutページ
├── components/
│   ├── BlockImageUpload.tsx  # 複数画像アップロード（最大5枚/ブロック）
│   ├── ImageLightbox.tsx     # 画像拡大ビュー（スワイプ対応）
│   └── ImageUpload.tsx       # 単一画像アップロード（レガシー）
├── lib/
│   ├── firebase.ts       # Firebase初期化
│   ├── auth-context.tsx  # 認証コンテキスト（プロファイル自動作成）
│   ├── firestore.ts      # Firestore CRUD操作
│   ├── storage.ts        # Firebase Storage操作 + 画像圧縮
│   └── export-utils.ts   # CSV/PDFエクスポート
├── messages/             # 多言語翻訳ファイル (ja/en/zh)
├── types/index.ts        # TypeScript型定義 + 定数
├── i18n.ts              # next-intl設定
├── routing.ts           # ルーティング設定
└── middleware.ts        # next-intl middleware
```

## 重要な設計決定

### 1. Next.js 16+ 対応
- `params` が Promise になったため、すべて `await` で展開
- `app/[locale]/layout.tsx`: `params: Promise<{ locale: string }>`

### 2. TailwindCSS v4
- PostCSSプラグインが `@tailwindcss/postcss` に変更
- `globals.css` で `@import "tailwindcss";` を使用
- `tailwind.config.ts` は不要（削除済み）

### 3. next-intl v4 設定
- `routing.ts` でロケール設定を一元管理
- `i18n.ts` で `requestLocale` を使用（Next.js 15+対応）
- `middleware.ts` で routing をインポート

### 4. Firestore データモデル

**memos コレクション:**
```typescript
{
  id: string (自動生成)
  userId: string
  userName?: string       // 公開メモの投稿者名
  title: string
  blocks: MemoBlock[]
  isPublic?: boolean      // 公開設定
  prefecture?: string     // 都道府県
  district?: string       // 地区
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
  imageUrl?: string       // 単一画像（レガシー互換）
  caption?: string        // 画像キャプション
  images?: string[]       // 複数画像URL（最大5枚/ブロック）
  categoryName: string
  tags: string[]
  order: number
}
```

**users コレクション:**
```typescript
{
  uid: string
  displayName: string
  photoURL?: string
  bio?: string
  lastPrefecture?: string  // 前回選択した都道府県
  createdAt: Timestamp
  updatedAt?: Timestamp
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

Storageルール:
```javascript
match /users/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 6. 画像アップロードフロー
- アップロード前に`validateImageFile()`で検証（5MB制限、形式チェック）
- 1MB超の画像は`compressImage()`でCanvas API経由でJPEG圧縮
- Firebase Storageに保存、ダウンロードURLをFirestoreに格納
- 削除時はFirebase Storageからも`deleteImage()`で削除

### 7. 都道府県・地区の設計
- 47都道府県は`PREFECTURES`定数（`types/index.ts`）
- 地区は`DISTRICTS`定数（プロジェクト内管理、Firebase同期なし、拡張容易）
- ユーザーの前回選択都道府県は`UserProfile.lastPrefecture`としてFirestoreに保存
- 次回エディタ起動時に自動選択

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

## 実装済み機能

### 認証・ユーザー管理
- ✅ Google Sign-In 認証
- ✅ ログイン時のユーザープロファイル自動作成
- ✅ プロフィール編集機能（表示名、自己紹介）

### メモ機能
- ✅ メモCRUD（作成・読取・更新・削除）
- ✅ ページング型エディタ（カテゴリ別ページ送り）
- ✅ メモ一覧表示（自分の記録 / みんなの記録 タブ）
- ✅ メモ詳細表示（ブロックコピー機能付き）
- ✅ メモ編集機能
- ✅ 公開メモ機能（isPublic設定、投稿者名表示）

### 検索・フィルタリング
- ✅ キーワード検索（タイトル・本文・タグ）
- ✅ タグフィルタリング（複数タグAND条件）

### テンプレート
- ✅ iOS版互換カスタムテンプレート（20+項目）
- ✅ カテゴリごとのヒントテンプレート機能（16カテゴリ、48+サブテンプレート）
- ✅ 記録タイプ（建物・施設 / 活動）
- ✅ 記録モード（デフォルト / カスタム）

### 画像
- ✅ ブロックごとの複数画像アップロード（最大5枚/ブロック）
- ✅ 画像自動圧縮（1MB超はCanvas APIでJPEG圧縮）
- ✅ サムネイルグリッド表示
- ✅ 拡大ビュー（ImageLightbox、タッチスワイプ、キーボード操作対応）
- ✅ 画像キャプション機能
- ✅ Firebase Storage連携（アップロード・削除）

### 位置情報
- ✅ 都道府県選択（47都道府県）
- ✅ 地区選択（阪神北地区 + その他、拡張可能）
- ✅ 前回選択都道府県の自動復元（UserProfileに保存）

### エクスポート
- ✅ CSVエクスポート（BOM付きUTF-8、Excel日本語互換）
- ✅ PDFエクスポート（html2canvas + jsPDF、日本語完全対応）

### 分析
- ✅ 分析ダッシュボード（統計・タグランキング・月別グラフ）

### その他
- ✅ 多言語対応（ja/en/zh）
- ✅ レスポンシブデザイン
- ✅ 設定画面（言語選択UI、About）

## 未実装機能

### 優先度A
1. **PWA対応** - オフライン対応、ホーム画面追加、フルスクリーン表示
2. **カテゴリ別デフォルトタグ** - カテゴリ選択時に関連タグを自動提案

### 優先度B
3. **UIアニメーション強化** - iOS版に近いリッチなアニメーション
4. **画像コメント機能** - 各画像に個別のキャプション（images配列対応版）

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
4. Storage セキュリティルールを設定
5. 必要に応じて複合インデックスを作成

## 注意事項

1. **Next.js 16 使用時**: `params` は必ず `await` する
2. **Firestore クエリ**: 複数フィールドのクエリは複合インデックスが必要
3. **多言語**: メッセージは `messages/` ディレクトリの JSON ファイルで管理
4. **認証**: すべてのページで `useAuth()` を使用してユーザー状態を確認
5. **画像アップロード**: Firebase Storageのセキュリティルール設定が必須

## 参考リンク

- [Next.js 16 ドキュメント](https://nextjs.org/docs)
- [next-intl ドキュメント](https://next-intl.dev/)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [TailwindCSS v4](https://tailwindcss.com/docs)

---

## 更新履歴

### 2026-02-03
- ✅ ブロックごとの複数画像アップロード（最大5枚、自動圧縮、Lightboxビューア）
- ✅ 都道府県選択（47都道府県、前回選択の自動復元）
- ✅ 地区選択（阪神北地区 + その他、拡張可能設計）
- ✅ CSV/PDFエクスポート機能
- ✅ ログイン時のユーザープロファイル自動作成
- ✅ CLAUDE.md 全面更新

### 2026-01-08
- ✅ iOS版互換カスタムテンプレート（20項目）完全実装
- ✅ カテゴリごとのヒントテンプレート機能（16カテゴリ、48+サブテンプレート）
- ✅ 設定画面（言語選択UI、Aboutページ）完全実装
- ✅ 画像キャプション機能（入力・表示UI）完全実装
- ✅ ナビゲーション改善（設定・分析へのアクセス）

### 2026-01-06
- 初版作成
- 基本機能実装完了

---

最終更新: 2026-02-03
