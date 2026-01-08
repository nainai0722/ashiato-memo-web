# Ashiato Memo Web App

子どもとのお出かけ記録に特化したWebアプリケーション。iOS版アプリと同じ構成・機能をFirebase連携で実装しています。

## 機能

### 実装済み機能

- ✅ **認証** - Google Sign-In
- ✅ **メモCRUD** - 作成・読取・更新・削除の完全実装
- ✅ **ページング型エディタ** - カテゴリごとに入力
- ✅ **メモリスト表示** - 検索・タグフィルター機能
- ✅ **メモ詳細表示** - ブロックコピー機能付き
- ✅ **メモ編集** - 既存メモの更新
- ✅ **分析ダッシュボード** - 統計・タグランキング・月別グラフ
- ✅ **画像アップロード** - Firebase Storage連携
- ✅ **多言語対応** - 日本語/英語/中国語
- ✅ **レスポンシブデザイン**

### 記録機能

1. **記録タイプ選択**
   - 建物・施設
   - 活動

2. **記録モード選択**
   - デフォルト記録（よく使う7項目）
   - カスタム記録（自分で項目を選択、最大10項目）

3. **ページング型エディタ**
   - カテゴリごとに1ページずつ入力
   - テンプレートヒント機能
   - タグ自動挿入（#気づき、#反省、#アイデア等）
   - 進捗バー表示

4. **レビュー・保存**
   - 保存前に内容確認
   - 編集に戻る機能

## 技術スタック

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: TailwindCSS
- **Backend**: Firebase
  - Authentication (Google Sign-In)
  - Firestore (NoSQL Database)
  - Storage (画像保存用、将来実装予定)
  - Hosting
- **i18n**: next-intl

## プロジェクト構造

```
ashiato-memo-web/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx (ログイン画面)
│   │   └── memos/
│   │       ├── page.tsx (一覧)
│   │       └── create/
│   │           ├── page.tsx (タイプ・モード選択)
│   │           ├── editor/
│   │           │   └── page.tsx (ページング型エディタ)
│   │           └── review/
│   │               └── page.tsx (レビュー・保存)
│   ├── layout.tsx
│   └── globals.css
├── components/ (共通コンポーネント)
├── lib/
│   ├── firebase.ts (Firebase初期化)
│   ├── auth-context.tsx (認証コンテキスト)
│   └── firestore.ts (Firestore操作)
├── messages/
│   ├── ja.json (日本語)
│   ├── en.json (英語)
│   └── zh.json (中国語)
├── types/
│   └── index.ts (TypeScript型定義)
├── i18n.ts
├── middleware.ts
└── next.config.ts
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Webアプリを追加（⚙️ > プロジェクトの設定 > アプリ）
4. Firebase SDK設定をコピー

### 3. Firebase サービスの有効化

#### Authentication

1. Firebase Console > Authentication > 始める
2. Sign-in method > Google を有効化
3. プロジェクトのサポートメールを設定
4. 保存

#### Firestore Database

1. Firebase Console > Firestore Database > データベースを作成
2. 本番環境モードで開始
3. ロケーション: `asia-northeast1` (東京) を選択
4. 作成完了後、ルール を以下に変更:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // メモコレクションのルール
    match /memos/{memoId} {
      // ログイン済みユーザーのみ読み書き可能
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;

      // 自分のメモのみ読み取り・削除可能
      allow read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Cloud Storage (オプション・将来の画像機能用)

1. Firebase Console > Storage > 始める
2. 本番環境モードで開始
3. ロケーション: `asia-northeast1` (東京) を選択

### 4. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、Firebase設定値を記入:

```bash
cp .env.local.example .env.local
```

`.env.local` を編集:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Firebase SDKの設定値は、Firebase Console > プロジェクトの設定 > SDK の設定と構成 で確認できます。

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## デプロイ

### Firebase Hosting へのデプロイ

1. Firebase CLI をインストール:

```bash
npm install -g firebase-tools
```

2. Firebaseにログイン:

```bash
firebase login
```

3. Firebase プロジェクトを初期化:

```bash
firebase init hosting
```

- プロジェクトを選択
- Public directory: `out` を指定
- Single-page app: `No`
- GitHub Actions: お好みで

4. ビルド:

```bash
npm run build
```

5. デプロイ:

```bash
firebase deploy --only hosting
```

## データベース設計

### memos コレクション

```typescript
{
  id: string (自動生成)
  userId: string
  title: string
  blocks: [
    {
      id: string
      type: 'text' | 'image'
      text?: string
      imageUrl?: string
      caption?: string
      categoryName: string
      tags: string[]
      order: number
    }
  ]
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

## 多言語対応

アプリは以下の言語に対応しています:

- 日本語 (ja) - デフォルト
- English (en)
- 中国語 (zh)

言語の切り替えは URL パラメータで行います:

- 日本語: http://localhost:3000/ja
- English: http://localhost:3000/en
- 中国語: http://localhost:3000/zh

## 今後の拡張予定

- エディタへの画像統合（ImageUploadコンポーネントの組み込み）
- メモ共有機能（URL共有、公開/非公開設定）
- エクスポート機能（PDF、CSV）
- PWA対応（オフライン対応、ホーム画面追加）
- 設定画面（言語選択UI、プロフィール編集）

## トラブルシューティング

### ビルドエラーが発生する

- `npm install` で依存関係を再インストール
- `.next` フォルダを削除して再ビルド: `rm -rf .next && npm run build`

### Firebase接続エラー

- `.env.local` の設定値を確認
- Firebase Console でプロジェクト設定を確認
- Firestore と Authentication が有効化されているか確認

### 認証エラー

- Firebase Console > Authentication > Sign-in method で Google が有効か確認
- 承認済みドメインに `localhost` が含まれているか確認

## ライセンス

MIT

## 開発者

iOS版 AshiatoMemoApp を元に、Web版として開発
