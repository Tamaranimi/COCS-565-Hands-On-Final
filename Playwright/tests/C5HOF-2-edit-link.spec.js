const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

test("C5HOF-2: Edit Link", async ({ page }) => {
  await loginIfNeeded(page);

  await page.goto("/links");
  await page.waitForTimeout(800);

  // Pick the first row/card and click EDIT (adjust if not a table)
  const firstRow = page.locator("tr").nth(1);
  await firstRow.getByRole("button", { name: /edit/i }).click();
  await page.waitForTimeout(600);

  const updatedTitle = `Updated Link ${Date.now()}`;
  await page.getByLabel(/title|name/i).fill(updatedTitle);
  await page.waitForTimeout(300);

  await page.getByRole("button", { name: /save|update/i }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  await expect(page.getByText(updatedTitle).first()).toBeVisible();
});
