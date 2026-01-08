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

## 実装済み機能

- ✅ Google Sign-In 認証
- ✅ メモCRUD（作成・読取・更新・削除）完全実装
- ✅ ページング型エディタ
- ✅ メモ一覧表示
- ✅ メモ詳細表示（ブロックコピー機能付き）
- ✅ メモ編集機能
- ✅ 検索機能（タイトル・本文・タグ）
- ✅ タグフィルタリング
- ✅ 分析ダッシュボード（統計・タグランキング・月別グラフ）
- ✅ 画像アップロード機能（Firebase Storage連携）
- ✅ 画像キャプション機能（入力・表示）
- ✅ 多言語対応（ja/en/zh）
- ✅ レスポンシブデザイン
- ✅ iOS版互換カスタムテンプレート（20+項目）
- ✅ カテゴリごとのヒントテンプレート機能（サブテンプレート）
- ✅ 設定画面（言語選択UI、About）

## 未実装機能

### 優先度A
1. ~~**エディタへの画像統合**~~ → ✅ 完了（2026-01-08）
2. ~~**設定画面**~~ → ✅ 完了（2026-01-08）

### 優先度B
3. **メモ共有機能** - URL共有、公開/非公開設定
4. **エクスポート機能** - PDF/CSV出力
5. **PWA対応** - オフライン対応、ホーム画面追加
6. **プロフィール編集機能** - ユーザー情報編集

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

## iOS版との実装差分

### 基本的な違い

| 項目 | iOS版 | Web版 |
|------|-------|-------|
| データ保存 | SwiftData（ローカル） | Firestore（クラウド） |
| 認証 | なし | Google Sign-In |
| 画像 | URL表示のみ | Firebase Storage連携済み |
| 分析 | 完全実装 | 完全実装 |
| UI Framework | SwiftUI | React + Next.js |

### iOS版実装済み・Web版未実装の機能

#### 🔴 **優先度S（コア機能の差分）**

##### 1. 充実したテンプレートシステム

**iOS版**: 20個のカスタムカテゴリオプション
- **building（建物・施設）**: 10項目
  - 混雑度、未就学児の考慮、対象年齢、危険予測、事前学習、気づいたこと、オトナが楽しめるポイント、お土産、記念品、カブブック記録場所検討
- **activity（活動）**: 10項目
  - 集合時間、活動内容、備品メモ、危険予測、事前学習、気づいたこと、オトナが楽しめるポイント、お土産、記念品、カブブック記録場所検討

**Web版**: 20個のカスタムカテゴリオプション（iOS版とは異なる）
- **building（建物・施設）**: 10項目
  - 営業時間、料金、アクセス、駐車場、バリアフリー、予約の必要性、混雑状況、周辺施設、注意事項、その他
- **activity（活動）**: 10項目
  - 準備したもの、天候、参加者、費用、所要時間、難易度、子どもの反応、安全対策、おすすめポイント、その他

**実装場所**:
- iOS: `/AshiatoMemoApp/Model/CategoryData.swift`
- Web: `/types/index.ts` (CUSTOM_BUILDING_CATEGORIES, CUSTOM_ACTIVITY_CATEGORIES)

**実装状況**: ✅ 完了（2026-01-08）iOS版の20項目を完全実装

##### 2. カテゴリごとのヒントテンプレート機能

**iOS版**: 完全実装
- 各カテゴリに複数のサブテンプレート（タイトル + 例文）
- 例: "施設の概要" → "施設情報"、"駐車場情報"、"料金"
- 例: "反省点" → "計画面"、"現地対応"、"教訓"
- 20以上のカテゴリに対応したヒント
- テンプレートテキストの挿入可能

**Web版**: 未実装
- 簡易的なヒントのみ（CategoryData.hint）
- サブテンプレート機能なし

**実装場所**:
- iOS: `CategoryData.swift` の `CategoryTemplates.categoryHints`
- Web: `/types/index.ts` (CATEGORY_HINTS), `/app/[locale]/memos/create/editor/page.tsx`

**実装状況**: ✅ 完了（2026-01-08）全16カテゴリにサブテンプレート実装

##### 3. 記録タイプの明確な分類

**iOS版**:
- 建物・施設（building）
- 活動（activity）
- それぞれ異なるデフォルトカテゴリ（7項目）

**Web版**:
- 同様に実装済み
- 建物・施設（building）
- 活動（activity）

**実装状況**: ✅ 実装済み

#### 🟠 **優先度A（UX向上）**

##### 4. 記録モードの選択

**iOS版**:
- 標準記録（7つの固定カテゴリ）
- カスタム記録（ユーザーが自由に選択）

**Web版**:
- 同様に実装済み
- デフォルト記録（default）
- カスタム記録（custom）

**実装状況**: ✅ 実装済み

##### 5. 設定画面（言語選択UI）

**iOS版**: 完全実装
- `SettingsView.swift`
- AppStorage連携による言語切り替え
- Aboutページ

**Web版**: 完全実装
- `/app/[locale]/settings/page.tsx`
- 言語選択UI（日本語・英語・中国語）
- Aboutページ（`/app/[locale]/settings/about/page.tsx`）

**実装場所**:
- iOS: `View/SettingsView.swift`
- Web: `/app/[locale]/settings/`, `/messages/*.json`

**実装状況**: ✅ 完了（2026-01-08）言語切り替え・About完全実装

##### 6. リッチなUIアニメーション

**iOS版**:
- spring/scale/opacityアニメーション
- カスタムViewModifier（PlumpButton）
- ジェスチャー対応

**Web版**:
- CSS基本アニメーション
- Tailwind CSS transitions
- iOS版ほど豊富ではない

**実装状況**: △ 部分実装

#### 🟡 **優先度B（細かい差分）**

##### 7. カテゴリ別のデフォルトタグ

**iOS版**: カテゴリごとに関連タグを自動提案（可能性あり）

**Web版**: 一般タグのみ（COMMON_TAGS）

**実装状況**: ❌ 未実装

##### 8. 画像のキャプション機能

**iOS版**: `MemoBlock.caption`フィールドあり

**Web版**: `MemoBlock.caption`フィールドあり

**実装場所**:
- iOS: `Model/MemoBlock.swift`
- Web: `types/index.ts`, `components/ImageUpload.tsx`, `app/[locale]/memos/[id]/page.tsx`

**実装状況**: ✅ 完了（2026-01-08）入力・表示UI完全実装

##### 9. ネイティブコピー機能

**iOS版**: `UIPasteboard`を使用したブロックコピー

**Web版**: Web Clipboard API使用（機能的には同等）

**実装状況**: ✅ 実装済み

### 機能比較マトリクス

| 機能カテゴリ | iOS版 | Web版 | 実装難易度 |
|-------------|-------|-------|-----------|
| **テンプレート** | 20カスタムオプション（子育て特化） | 20カスタムオプション（一般的） | ⭐⭐ |
| **ヒントテンプレート** | 完全実装（サブテンプレート） | なし | ⭐⭐⭐ |
| **記録タイプ分類** | building/activity | building/activity | ✅ 同等 |
| **記録モード** | 標準/カスタム | デフォルト/カスタム | ✅ 同等 |
| **設定画面** | 実装済み | なし | ⭐ |
| **UIアニメーション** | 豊富 | 基本のみ | ⭐⭐⭐ |
| **画像キャプション** | あり | 型定義のみ | ⭐ |
| **認証機能** | なし | Google Sign-In | Web版のみ |
| **クラウド同期** | なし | Firestore | Web版のみ |

### 推奨実装順序

1. **第1フェーズ**: iOS版のカスタムカテゴリオプション（子育て特化）をWeb版に統合
2. **第2フェーズ**: ヒントテンプレート機能（サブテンプレート + 例文挿入）
3. **第3フェーズ**: 設定画面（言語選択UI）
4. **第4フェーズ**: 画像キャプション機能のUI実装
5. **第5フェーズ**: UIアニメーション強化

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

## 更新履歴

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

最終更新: 2026-01-08
