const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

async function clickFirstVisible(...locators) {
  for (const loc of locators) {
    if (await loc.isVisible().catch(() => false)) {
      await loc.click();
      return;
    }
  }
  throw new Error("None of the provided locators were visible.");
}

test("C5HOF-3: Delete Link", async ({ page }) => {
  await loginIfNeeded(page);

  const linkName = `DeleteMe-${Date.now()}`;

  await page.getByRole("button", { name: /quick apps/i }).click();
  await page.getByRole("link", { name: /quick links/i }).click();

  await page.getByRole("button", { name: /new link/i }).click();
  await page.getByRole("textbox", { name: /enter link name/i }).fill(linkName);
  await page.getByRole("button", { name: /create link/i }).click();

  const row = page.getByRole("row", { name: new RegExp(linkName) });
  await expect(row).toBeVisible();

  await clickFirstVisible(
    row.getByLabel(/options|actions|more/i),
    row.getByRole("button", { name: /options|actions|more/i })
  );

  await clickFirstVisible(
    page.getByRole("menuitem", { name: /delete|remove/i }),
    page.getByRole("button", { name: /delete|remove/i })
  );

  // Confirm modal (if shown)
  const confirm = page.getByRole("button", { name: /confirm|delete|yes/i });
  if (await confirm.isVisible().catch(() => false)) await confirm.click();

  await expect(page.getByRole("row", { name: new RegExp(linkName) })).toHaveCount(0);
});
