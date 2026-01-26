// Data types for AshiatoMemo Web App

// User Profile
export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type MemoBlockType = 'text' | 'image';

export type RecordType = 'building' | 'activity';

export type RecordMode = 'default' | 'custom';

export interface MemoBlock {
  id: string;
  type: MemoBlockType;
  text?: string;
  imageUrl?: string;
  caption?: string;
  categoryName: string;
  tags: string[];
  order: number;
}

export interface AshiatoMemo {
  id: string;
  userId: string;
  userName?: string;  // 公開メモで表示する投稿者名
  title: string;
  blocks: MemoBlock[];
  isPublic?: boolean;  // 公開設定（true: 公開, false/undefined: 非公開）
  createdAt: Date;
  updatedAt?: Date;
}

export interface CategoryData {
  name: string;
  hint: string;
  templates: string[];
}

export interface HintTemplate {
  name: string;
  template: string;
}

export interface RecordSettings {
  recordType: RecordType;
  recordMode: RecordMode;
  selectedCategories: string[];
}

// Common tags
export const COMMON_TAGS = [
  '#気づき',
  '#反省',
  '#アイデア',
  '#調べる',
  '#誰かに相談する'
] as const;

// Default categories for building/facility
export const DEFAULT_BUILDING_CATEGORIES: CategoryData[] = [
  { name: '施設の概要', hint: '施設の基本情報を記録しましょう', templates: ['名称：\n場所：\n特徴：'] },
  { name: '所感', hint: 'どう感じましたか？', templates: ['良かった点：\n気になった点：'] },
  { name: 'トイレ', hint: 'トイレの情報', templates: ['場所：\n清潔度：\nおむつ交換台：'] },
  { name: '休憩スペース', hint: '休憩できる場所', templates: ['場所：\n広さ：\n設備：'] },
  { name: '食事場所はあるか', hint: '食事ができる場所', templates: ['場所：\n種類：\n価格帯：'] },
  { name: '持っていくべき荷物', hint: '必要な持ち物', templates: ['必須：\nあると便利：'] },
  { name: '反省点', hint: '次回に活かすこと', templates: ['失敗した点：\n気づいた点：\n次に活かすこと：'] }
];

// Default categories for activity
export const DEFAULT_ACTIVITY_CATEGORIES: CategoryData[] = [
  { name: '活動内容の概要', hint: '活動の基本情報を記録しましょう', templates: ['活動名：\n場所：\n時間：'] },
  { name: '所感', hint: 'どう感じましたか？', templates: ['良かった点：\n気になった点：'] },
  { name: 'トイレ', hint: 'トイレの情報', templates: ['場所：\n清潔度：\nおむつ交換台：'] },
  { name: '休憩スペース', hint: '休憩できる場所', templates: ['場所：\n広さ：\n設備：'] },
  { name: '食事場所はあるか', hint: '食事ができる場所', templates: ['場所：\n種類：\n価格帯：'] },
  { name: '持っていくべき荷物', hint: '必要な持ち物', templates: ['必須：\nあると便利：'] },
  { name: '反省点', hint: '次回に活かすこと', templates: ['失敗した点：\n気づいた点：\n次に活かすこと：'] }
];

// Custom categories for building/facility (iOS compatible)
export const CUSTOM_BUILDING_CATEGORIES = [
  '混雑度',
  '未就学児の考慮',
  '対象年齢',
  '危険予測',
  '事前学習',
  '気づいたこと',
  'オトナが楽しめるポイント',
  'お土産',
  '記念品',
  'カブブック記録場所検討'
] as const;

// Custom categories for activity (iOS compatible)
export const CUSTOM_ACTIVITY_CATEGORIES = [
  '集合時間',
  '活動内容',
  '備品メモ',
  '危険予測',
  '事前学習',
  '気づいたこと',
  'オトナが楽しめるポイント',
  'お土産',
  '記念品',
  'カブブック記録場所検討'
] as const;

// Category hint templates (iOS compatible)
export const CATEGORY_HINTS: Record<string, HintTemplate[]> = {
  '施設の概要': [
    { name: '施設情報', template: '施設名：\n営業時間：\n所在地：\nWebサイト：' },
    { name: '駐車場情報', template: '場所：\n台数：\n距離：\n料金：' },
    { name: '料金', template: '大人：\n子ども：\n割引：' }
  ],
  '反省点': [
    { name: '計画面', template: '失敗した点：\n気づいた点：' },
    { name: '現地対応', template: '困ったこと：' },
    { name: '教訓', template: '次に活かすこと：' }
  ],
  '活動内容の概要': [
    { name: '基本情報', template: '活動名：\n時間：\n場所：' },
    { name: '参加者', template: '人数：\n年齢層：' },
    { name: '内容', template: '概要：' }
  ],
  'トイレ': [
    { name: '基本情報', template: '場所：\n数：\n清潔度：' },
    { name: '設備', template: 'おむつ替え台：\nベビーチェア：' },
    { name: 'アクセス', template: '距離：\n案内表示：' }
  ],
  '所感': [
    { name: '全体的な印象', template: '良かった点：\n改善してほしい点：' },
    { name: '子どもの反応', template: '楽しんでいた点：\n飽きていた点：' },
    { name: '大人の視点', template: '学びになった点：\n疲労度：' }
  ],
  '集合時間': [
    { name: '基本情報', template: '集合時刻：\n集合場所：\n解散時刻：' },
    { name: '準備時間', template: '準備開始：\n移動時間：' },
    { name: '注意事項', template: '遅刻対応：\n緊急連絡先：' }
  ],
  '活動内容': [
    { name: '概要', template: '活動名：\n目的：\n対象年齢：' },
    { name: '詳細', template: '進行手順：\n必要時間：\n難易度：' },
    { name: '準備物', template: '材料：\n道具：\n配布物：' }
  ],
  '備品メモ': [
    { name: '持参品', template: '個人持参：\n団体持参：\n忘れ物対策：' },
    { name: '現地調達', template: '購入予定：\n借用予定：\n代替案：' },
    { name: '管理', template: '責任者：\n保管場所：\n返却方法：' }
  ],
  '混雑度': [
    { name: '時間帯', template: '平日：\n土日祝：\nピーク時間：' },
    { name: '季節要因', template: '春夏：\n秋冬：\n特別期間：' },
    { name: '対策', template: '回避方法：\n待ち時間：\n代替プラン：' }
  ],
  '未就学児の考慮': [
    { name: '安全面', template: '危険箇所：\n注意事項：\n見守りポイント：' },
    { name: '設備', template: 'ベビーカー：\nおむつ替え：\n授乳室：' },
    { name: '配慮事項', template: '年齢制限：\n体力的配慮：\n興味の持続：' }
  ],
  '対象年齢': [
    { name: '推奨年齢', template: '最適年齢：\n下限年齢：\n上限年齢：' },
    { name: '年齢別対応', template: '幼児向け：\n小学生向け：\n中高生向け：' },
    { name: '調整方法', template: '難易度調整：\n時間調整：\n内容変更：' }
  ],
  '危険予測': [
    { name: '物理的危険', template: '転倒リスク：\n衝突リスク：\n落下リスク：' },
    { name: '環境的危険', template: '天候影響：\n交通状況：\n人混み：' },
    { name: '対策', template: '予防策：\n対応手順：\n緊急時連絡：' }
  ],
  '事前学習': [
    { name: '調査項目', template: '基本情報：\n利用方法：\nルール・マナー：' },
    { name: '準備資料', template: 'パンフレット：\nWebサイト：\n体験談：' },
    { name: '共有方法', template: '説明資料：\n事前説明：\n当日説明：' }
  ],
  '気づいたこと': [
    { name: '発見', template: '新しい発見：\n意外だった点：\n興味深い点：' },
    { name: '学び', template: '教育的価値：\n体験の意味：\n今後の活用：' },
    { name: '改善点', template: '準備不足：\n情報不足：\n計画変更点：' }
  ],
  'オトナが楽しめるポイント': [
    { name: '大人向け要素', template: '歴史・文化：\n技術・仕組み：\n芸術・美学：' },
    { name: 'リラックス', template: '休憩スペース：\nカフェ・食事：\n景色・雰囲気：' },
    { name: '学習機会', template: '専門知識：\n新しい体験：\n話題作り：' }
  ],
  'お土産': [
    { name: '種類', template: '食品：\n雑貨：\n記念品：' },
    { name: '価格帯', template: '予算：\n相場：\nコスパ：' },
    { name: '購入ポイント', template: 'おすすめ：\n注意点：\n保存方法：' }
  ],
  '記念品': [
    { name: '撮影', template: '写真スポット：\n撮影ルール：\nデータ保存：' },
    { name: '作品', template: '制作物：\n持ち帰り：\n保管方法：' },
    { name: '思い出', template: '印象的場面：\n子どもの反応：\n記録方法：' }
  ],
  'カブブック記録場所検討': [
    { name: '記録項目', template: '活動内容：\n学んだこと：\n感想：' },
    { name: '写真選定', template: '代表写真：\n活動写真：\n集合写真：' },
    { name: 'レイアウト', template: 'ページ構成：\nコメント欄：\n装飾アイデア：' }
  ]
};
