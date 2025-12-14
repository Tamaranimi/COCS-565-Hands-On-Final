import { test, expect } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('C5HOF-1 Create Link + Copy Link', async ({ page }) => {
  const linkName = `Test5-${Date.now()}`;

  await page.goto('https://app.grabdocs.com/login');

  await page.getByRole('textbox', { name: 'Username, Email or Phone' }).fill(process.env.EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // ⚠️ OTP changes every time. Use env var locally or use a test environment/user that doesn't require OTP.
  await page.getByRole('textbox', { name: 'Enter 6-digit code' }).fill(process.env.OTP);
  await page.getByRole('button', { name: 'Verify Code' }).click();

  await page.getByRole('button', { name: 'Quick Apps' }).click();
  await page.getByRole('link', { name: 'Quick Links' }).click();

  await page.getByRole('button', { name: 'New Link' }).click();
  await page.getByRole('textbox', { name: 'Enter link name' }).fill(linkName);

  // Only set datetime if your app requires it (codegen clicked 4x; that’s noise)
  // const dt = page.locator('input[type="datetime-local"]');
  // if (await dt.count()) await dt.fill('2025-12-31T23:59');

  await page.getByRole('button', { name: 'Create Link' }).click();

  const row = page.getByRole('row', { name: new RegExp(linkName) });
  await expect(row).toBeVisible();

  await row.getByLabel('Options').click();
  await page.getByRole('button', { name: 'Share' }).click();
  await page.getByRole('button', { name: 'Copy Link' }).click();

  const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
  await expect(shareUrl).toMatch(/^https?:\/\//);
  console.log('Copied share URL:', shareUrl);
});
