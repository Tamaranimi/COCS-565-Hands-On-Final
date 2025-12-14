const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

test("C5HOF-3: Delete Link", async ({ page }) => {
  await loginIfNeeded(page);

  await page.goto("/links");
  await page.waitForTimeout(800);

  // Pick the first row/card and delete (adjust if not a table)
  const row = page.locator("tr").nth(1);
  const rowText = await row.innerText();

  await row.getByRole("button", { name: /delete|remove/i }).click();
  await page.waitForTimeout(600);

  const confirmBtn = page.getByRole("button", { name: /confirm|yes|delete/i });
  if (await confirmBtn.count()) await confirmBtn.click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  await expect(page.getByText(rowText)).toHaveCount(0);
});
