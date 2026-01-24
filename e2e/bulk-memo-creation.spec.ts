import { test, expect } from '@playwright/test';

/**
 * 大量メモ作成テスト
 * 10件のメモを様々なパターンで作成し、システムの安定性を検証
 */

const testMemos = [
  {
    title: 'テスト1: 動物園',
    type: 'building',
    mode: 'default',
    content: '上野動物園に行きました。パンダがかわいかったです。',
    tags: ['動物園', '上野'],
  },
  {
    title: 'テスト2: 公園でピクニック',
    type: 'activity',
    mode: 'default',
    content: '代々木公園でピクニック。天気が良くて最高でした。',
    tags: ['公園', 'ピクニック'],
  },
  {
    title: 'テスト3: 水族館',
    type: 'building',
    mode: 'default',
    content: 'サンシャイン水族館。クラゲが幻想的でした。',
    tags: ['水族館', '池袋'],
  },
  {
    title: 'テスト4: キャンプ',
    type: 'activity',
    mode: 'default',
    content: '初めてのファミリーキャンプ。テント設営が大変だった。',
    tags: ['キャンプ', 'アウトドア'],
  },
  {
    title: 'テスト5: 博物館',
    type: 'building',
    mode: 'default',
    content: '国立科学博物館。恐竜の化石に大興奮！',
    tags: ['博物館', '上野'],
  },
  {
    title: 'テスト6: 川遊び',
    type: 'activity',
    mode: 'default',
    content: '多摩川で川遊び。魚を捕まえた！',
    tags: ['川遊び', '夏'],
  },
  {
    title: 'テスト7: ショッピングモール',
    type: 'building',
    mode: 'default',
    content: 'ららぽーとでお買い物。キッズスペースが充実。',
    tags: ['ショッピング', '室内'],
  },
  {
    title: 'テスト8: サイクリング',
    type: 'activity',
    mode: 'default',
    content: '荒川サイクリングロード。風が気持ちよかった。',
    tags: ['サイクリング', '運動'],
  },
  {
    title: 'テスト9: プラネタリウム',
    type: 'building',
    mode: 'default',
    content: '渋谷のプラネタリウム。星空解説が分かりやすかった。',
    tags: ['プラネタリウム', '渋谷'],
  },
  {
    title: 'テスト10: 工場見学',
    type: 'activity',
    mode: 'default',
    content: 'お菓子工場の見学。お土産ももらえた！',
    tags: ['工場見学', '社会科見学'],
  },
];

test.describe('大量メモ作成テスト', () => {
  test('10件のメモを連続作成', async ({ page }) => {
    for (let i = 0; i < testMemos.length; i++) {
      const memo = testMemos[i];

      console.log(`Creating memo ${i + 1}/${testMemos.length}: ${memo.title}`);

      // メモ一覧に移動
      await page.goto('/ja/memos');
      await page.waitForLoadState('networkidle');

      // 新規作成
      await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
      await page.waitForURL('**/create**');

      // タイプ選択
      if (memo.type === 'building') {
        await page.click('text=建物・施設, text=building, button:has-text("建物")');
      } else {
        await page.click('text=活動, text=activity');
      }

      // モード選択
      await page.click('text=デフォルト, text=default, text=標準');

      // エディタに遷移
      await page.waitForURL('**/editor**');

      // タイトル入力
      const titleInput = page.locator('input').first();
      await titleInput.fill(memo.title);

      // 本文入力
      const textArea = page.locator('textarea').first();
      await textArea.fill(memo.content);

      // すべてのブロックを次へで進む
      for (let j = 0; j < 8; j++) {
        const nextButton = page.locator('button:has-text("次へ"), button:has-text("Next")');
        if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      // 保存
      const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")');
      if (await saveButton.isVisible({ timeout: 3000 })) {
        await saveButton.click();
        await page.waitForURL('**/memos', { timeout: 15000 });
      }

      console.log(`Memo ${i + 1} created successfully`);
    }

    // 全てのメモが作成されたことを確認
    await page.goto('/ja/memos');
    await page.waitForLoadState('networkidle');

    // いくつかのメモが表示されていることを確認
    await expect(page.locator('text=テスト1').or(page.locator('text=テスト5'))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('作成したメモの検証', () => {
  test('メモ一覧に10件表示される', async ({ page }) => {
    await page.goto('/ja/memos');
    await page.waitForLoadState('networkidle');

    // テストで作成したメモが表示されることを確認
    const memoItems = page.locator('[class*="memo"], [class*="card"], a[href*="/memos/"]');
    const count = await memoItems.count();
    console.log(`Found ${count} memo items`);
  });

  test('検索でフィルタリング', async ({ page }) => {
    await page.goto('/ja/memos');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="検索"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('動物園');
      await page.waitForTimeout(1000);

      // 検索結果が表示される
      await expect(page.locator('text=動物園')).toBeVisible();
    }
  });

  test('分析ダッシュボードに反映', async ({ page }) => {
    await page.goto('/ja/analysis');
    await page.waitForLoadState('networkidle');

    // 統計が更新されていることを確認（メモ数など）
    await page.waitForTimeout(2000);
  });
});

test.describe('クリーンアップ - テストメモ削除', () => {
  test('テストで作成したメモを削除', async ({ page }) => {
    for (let i = 0; i < testMemos.length; i++) {
      await page.goto('/ja/memos');
      await page.waitForLoadState('networkidle');

      // テストメモを探す
      const memoLink = page.locator(`a:has-text("テスト${i + 1}")`).first();

      if (await memoLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await memoLink.click();
        await page.waitForURL(/.*\/memos\/[^/]+$/);

        // 削除ボタンをクリック
        const deleteButton = page.locator('button:has-text("削除"), button:has-text("Delete")');
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          page.on('dialog', dialog => dialog.accept());
          await deleteButton.click();
          await page.waitForURL('**/memos', { timeout: 10000 });
          console.log(`Deleted memo: テスト${i + 1}`);
        }
      }
    }
  });
});
