// Data types for AshiatoMemo Web App

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
  title: string;
  blocks: MemoBlock[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CategoryData {
  name: string;
  hint: string;
  templates: string[];
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

// Custom categories for building/facility
export const CUSTOM_BUILDING_CATEGORIES = [
  '営業時間',
  '料金',
  'アクセス',
  '駐車場',
  'バリアフリー',
  '予約の必要性',
  '混雑状況',
  '周辺施設',
  '注意事項',
  'その他'
] as const;

// Custom categories for activity
export const CUSTOM_ACTIVITY_CATEGORIES = [
  '準備したもの',
  '天候',
  '参加者',
  '費用',
  '所要時間',
  '難易度',
  '子どもの反応',
  '安全対策',
  'おすすめポイント',
  'その他'
] as const;
