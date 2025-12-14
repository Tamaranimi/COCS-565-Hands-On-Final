const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

test("C5HOF-4: Create Account (Company)", async ({ page }) => {
  await loginIfNeeded(page);

  // Go to Company page (adjust route)
  await page.goto("/company");
  await page.waitForTimeout(800);

  // Click Create Account / Create Company
  await clickFirstVisible(
  page.getByRole("link", { name: /company|companies|organization|workspace/i }),
  page.getByRole("button", { name: /company|companies|organization|workspace/i })
);


  // Fill required fields (adjust labels)
  await page.getByLabel(/company name|name/i).fill(`Company ${Date.now()}`);
  await page.waitForTimeout(300);

  // Submit
  await page.getByRole("button", { name: /save|create|submit/i }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  // Assert success (adjust to your UI)
  await expect(page.getByText(/success|created|company/i).first()).toBeVisible();
});
