const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

test("C5HOF-5: Members (Company)", async ({ page }) => {
  await loginIfNeeded(page);

  // Go to Members page (adjust route)
  await page.goto("/company/members");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(800);

  // Basic assertion: heading exists
  await expect(page.getByRole("heading", { name: /members/i })).toBeVisible();

  // Confirm list loads (table rows or cards)
  const rows = page.locator("tr");
  if (await rows.count()) {
    await expect(rows.nth(0)).toBeVisible();
  }

  await page.waitForTimeout(700);
});
