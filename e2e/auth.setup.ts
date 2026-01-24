import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

/**
 * 認証セットアップ
 *
 * Google Sign-Inは自動化が難しいため、初回は手動でログインが必要です。
 *
 * 手順:
 * 1. `npx playwright test --project=setup --headed` を実行
 * 2. ブラウザが開いたら手動でGoogleログインを完了
 * 3. メモ一覧画面が表示されたら認証状態が保存される
 * 4. 以降のテストは保存された認証状態を使用
 */
setup('authenticate', async ({ page }) => {
  // ログインページに移動
  await page.goto('/ja');

  // すでにログイン済みかチェック
  const isLoggedIn = await page.locator('text=メモ一覧').isVisible().catch(() => false);

  if (!isLoggedIn) {
    // Googleログインボタンを待機
    const loginButton = page.locator('button:has-text("Google"), button:has-text("ログイン")');

    if (await loginButton.isVisible()) {
      console.log('\n========================================');
      console.log('手動でGoogleログインを完了してください');
      console.log('ログイン後、メモ一覧画面が表示されるまで待ちます');
      console.log('========================================\n');

      // 手動ログインを待機（最大5分）
      await page.waitForURL('**/memos**', { timeout: 300000 });
    }
  }

  // メモ一覧画面を確認
  await expect(page).toHaveURL(/.*\/memos/);

  // 認証状態を保存
  await page.context().storageState({ path: authFile });
  console.log('認証状態を保存しました: ' + authFile);
});
