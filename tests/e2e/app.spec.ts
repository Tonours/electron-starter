import path from 'node:path';
import { expect, test } from '@playwright/test';
import { _electron as electron } from 'playwright';

test('Ping button returns PONG from main process', async () => {
  const mainEntry = path.resolve(process.cwd(), 'dist/main/index.cjs');

  const app = await electron.launch({
    args: [mainEntry],
  });

  const page = await app.firstWindow();

  await expect(
    page.getByRole('heading', { name: 'Electron Starter' })
  ).toBeVisible();
  await expect(page.getByText('Status: Waiting')).toBeVisible();

  await page.getByRole('button', { name: 'Ping' }).click();
  await expect(page.getByText('Status: PONG')).toBeVisible();

  await app.close();
});
