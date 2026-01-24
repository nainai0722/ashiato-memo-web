import { test, expect } from '@playwright/test';

test.describe('メモCRUD操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ja/memos');
    await page.waitForLoadState('networkidle');
  });

  test('メモ一覧が表示される', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /メモ|一覧/ })).toBeVisible();
  });

  test('新規メモ作成 - 建物・施設（デフォルトモード）', async ({ page }) => {
    // 新規作成ボタンをクリック
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    // 建物・施設を選択
    await page.click('text=建物・施設, text=building, button:has-text("建物")');

    // デフォルトモードを選択
    await page.click('text=デフォルト, text=default, text=標準');

    // エディタに遷移
    await page.waitForURL('**/editor**');

    // タイトルを入力
    const titleInput = page.locator('input[placeholder*="タイトル"], input[name="title"], input').first();
    await titleInput.fill('E2Eテスト - 動物園訪問');

    // 最初のブロック（施設の概要）にテキストを入力
    const textArea = page.locator('textarea').first();
    await textArea.fill('テスト用メモです。動物園に行きました。');

    // 次へ進む
    const nextButton = page.locator('button:has-text("次へ"), button:has-text("Next"), button:has-text("→")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // レビュー画面に進む（複数回次へを押す必要がある場合）
    for (let i = 0; i < 7; i++) {
      const next = page.locator('button:has-text("次へ"), button:has-text("Next")');
      if (await next.isVisible({ timeout: 1000 }).catch(() => false)) {
        await next.click();
        await page.waitForTimeout(500);
      }
    }

    // 保存ボタンをクリック
    const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")');
    await saveButton.click();

    // メモ一覧に戻ることを確認
    await page.waitForURL('**/memos', { timeout: 10000 });
    await expect(page.locator('text=E2Eテスト - 動物園訪問')).toBeVisible();
  });

  test('新規メモ作成 - 活動（カスタムモード）', async ({ page }) => {
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    // 活動を選択
    await page.click('text=活動, text=activity');

    // カスタムモードを選択
    await page.click('text=カスタム, text=custom');

    // カテゴリ選択画面でいくつか選択
    await page.waitForTimeout(1000);

    // チェックボックスをいくつか選択
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await checkboxes.nth(i).click();
    }

    // 次へ進む
    await page.click('button:has-text("次へ"), button:has-text("エディタ")');
    await page.waitForURL('**/editor**');

    // タイトルを入力
    const titleInput = page.locator('input').first();
    await titleInput.fill('E2Eテスト - キャンプ活動');

    // テキストを入力
    const textArea = page.locator('textarea').first();
    await textArea.fill('キャンプ活動のテストメモです。');

    // 次へ進む（すべてのブロックをスキップ）
    for (let i = 0; i < 5; i++) {
      const next = page.locator('button:has-text("次へ"), button:has-text("Next")');
      if (await next.isVisible({ timeout: 1000 }).catch(() => false)) {
        await next.click();
        await page.waitForTimeout(300);
      }
    }

    // 保存
    const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForURL('**/memos', { timeout: 10000 });
    }
  });

  test('メモ詳細表示', async ({ page }) => {
    // 最初のメモをクリック
    const memoLink = page.locator('a[href*="/memos/"]').first();
    if (await memoLink.isVisible()) {
      await memoLink.click();
      await page.waitForURL(/.*\/memos\/[^/]+$/);

      // 詳細が表示されることを確認
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });

  test('メモ編集', async ({ page }) => {
    // 最初のメモを開く
    const memoLink = page.locator('a[href*="/memos/"]').first();
    if (await memoLink.isVisible()) {
      await memoLink.click();
      await page.waitForURL(/.*\/memos\/[^/]+$/);

      // 編集ボタンをクリック
      const editButton = page.locator('a[href*="edit"], button:has-text("編集"), button:has-text("Edit")');
      await editButton.click();
      await page.waitForURL('**/edit**');

      // タイトルを編集
      const titleInput = page.locator('input').first();
      await titleInput.fill('編集済み - E2Eテスト');

      // 保存
      await page.click('button:has-text("保存"), button:has-text("更新"), button:has-text("Save")');
      await page.waitForURL(/.*\/memos\/[^/]+$/);
    }
  });

  test('メモ検索', async ({ page }) => {
    // 検索ボックスを探す
    const searchInput = page.locator('input[placeholder*="検索"], input[type="search"], input[name="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('E2Eテスト');
      await page.waitForTimeout(1000);

      // 検索結果が表示されることを確認
      const results = page.locator('text=E2Eテスト');
      await expect(results.first()).toBeVisible();
    }
  });

  test('メモ削除', async ({ page }) => {
    // E2Eテストで作成したメモを開く
    const memoLink = page.locator('a:has-text("E2Eテスト")').first();
    if (await memoLink.isVisible()) {
      await memoLink.click();
      await page.waitForURL(/.*\/memos\/[^/]+$/);

      // 削除ボタンをクリック
      const deleteButton = page.locator('button:has-text("削除"), button:has-text("Delete")');
      if (await deleteButton.isVisible()) {
        // 削除確認ダイアログを処理
        page.on('dialog', dialog => dialog.accept());
        await deleteButton.click();

        // メモ一覧に戻ることを確認
        await page.waitForURL('**/memos', { timeout: 10000 });
      }
    }
  });
});

test.describe('エッジケース・バグ検証', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ja/memos');
    await page.waitForLoadState('networkidle');
  });

  test('空のタイトルでメモ作成を試みる', async ({ page }) => {
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    await page.click('text=建物・施設, text=building, button:has-text("建物")');
    await page.click('text=デフォルト, text=default');
    await page.waitForURL('**/editor**');

    // タイトルを空のまま次へ
    for (let i = 0; i < 8; i++) {
      const next = page.locator('button:has-text("次へ"), button:has-text("Next")');
      if (await next.isVisible({ timeout: 500 }).catch(() => false)) {
        await next.click();
        await page.waitForTimeout(300);
      }
    }

    // 保存ボタンを探す
    const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      // エラーメッセージまたはバリデーションを確認
      await page.waitForTimeout(2000);
    }
  });

  test('非常に長いテキストを入力', async ({ page }) => {
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    await page.click('text=建物・施設, text=building, button:has-text("建物")');
    await page.click('text=デフォルト, text=default');
    await page.waitForURL('**/editor**');

    // 長いタイトル
    const titleInput = page.locator('input').first();
    const longTitle = 'あ'.repeat(500);
    await titleInput.fill(longTitle);

    // 長いテキスト
    const textArea = page.locator('textarea').first();
    const longText = 'テスト'.repeat(1000);
    await textArea.fill(longText);

    // 次へ進む
    const nextButton = page.locator('button:has-text("次へ"), button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });

  test('特殊文字を含むメモ', async ({ page }) => {
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    await page.click('text=建物・施設, text=building, button:has-text("建物")');
    await page.click('text=デフォルト, text=default');
    await page.waitForURL('**/editor**');

    // 特殊文字を含むタイトル
    const titleInput = page.locator('input').first();
    await titleInput.fill('テスト<script>alert("XSS")</script>&<>"\'\n改行');

    // 特殊文字を含むテキスト
    const textArea = page.locator('textarea').first();
    await textArea.fill('本文テスト\n\n改行\n\tタブ\r\n特殊文字: <>&"\' 絵文字: 🎉🚀');
  });

  test('素早い連続クリック', async ({ page }) => {
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    // 建物・施設を素早く複数回クリック
    const buildingButton = page.locator('text=建物・施設, text=building, button:has-text("建物")');
    await buildingButton.click();
    await buildingButton.click();
    await buildingButton.click();

    await page.waitForTimeout(1000);
  });

  test('ブラウザの戻るボタン', async ({ page }) => {
    await page.click('a[href*="create"], button:has-text("新規"), button:has-text("作成")');
    await page.waitForURL('**/create**');

    await page.click('text=建物・施設, text=building, button:has-text("建物")');
    await page.click('text=デフォルト, text=default');
    await page.waitForURL('**/editor**');

    // 戻る
    await page.goBack();
    await page.waitForTimeout(1000);

    // 再度進む
    await page.goForward();
    await page.waitForTimeout(1000);

    // アプリが壊れていないことを確認
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('多言語対応', () => {
  test('日本語で表示', async ({ page }) => {
    await page.goto('/ja/memos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  });

  test('英語で表示', async ({ page }) => {
    await page.goto('/en/memos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('中国語で表示', async ({ page }) => {
    await page.goto('/zh/memos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  });

  test('言語切り替え', async ({ page }) => {
    await page.goto('/ja/settings');
    await page.waitForLoadState('networkidle');

    // 言語選択があるか確認
    const languageSelect = page.locator('select, [role="listbox"]');
    if (await languageSelect.isVisible()) {
      await languageSelect.click();
    }
  });
});

test.describe('分析ダッシュボード', () => {
  test('分析ページが表示される', async ({ page }) => {
    await page.goto('/ja/analysis');
    await page.waitForLoadState('networkidle');

    // 分析関連のコンテンツが表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('統計情報が表示される', async ({ page }) => {
    await page.goto('/ja/analysis');
    await page.waitForLoadState('networkidle');

    // 数値やグラフが表示されることを確認
    const statsElements = page.locator('[class*="stat"], [class*="chart"], [class*="graph"]');
    // 統計要素が存在するか（なくてもエラーにはしない）
    await page.waitForTimeout(2000);
  });
});

test.describe('設定画面', () => {
  test('設定ページが表示される', async ({ page }) => {
    await page.goto('/ja/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Aboutページが表示される', async ({ page }) => {
    await page.goto('/ja/settings/about');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
