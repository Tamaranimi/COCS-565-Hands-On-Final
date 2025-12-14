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

test("C5HOF-2: Edit Link", async ({ page }) => {
  await loginIfNeeded(page);

  const linkName = `EditMe-${Date.now()}`;
  const updatedName = `Edited-${Date.now()}`;

  await page.getByRole("button", { name: /quick apps/i }).click();
  await page.getByRole("link", { name: /quick links/i }).click();

  await page.getByRole("button", { name: /new link/i }).click();
  await page.getByRole("textbox", { name: /enter link name/i }).fill(linkName);
  await page.getByRole("button", { name: /create link/i }).click();

  const row = page.getByRole("row", { name: new RegExp(linkName) });
  await expect(row).toBeVisible();

  // Options / Actions / More
  await clickFirstVisible(
    row.getByLabel(/options|actions|more/i),
    row.getByRole("button", { name: /options|actions|more/i })
  );

  // Edit / Rename sometimes is a menuitem
  await clickFirstVisible(
    page.getByRole("menuitem", { name: /edit|rename/i }),
    page.getByRole("button", { name: /edit|rename/i })
  );

  await page.getByRole("textbox", { name: /enter link name/i }).fill(updatedName);

  await clickFirstVisible(
    page.getByRole("button", { name: /update|save/i }),
    page.getByRole("menuitem", { name: /update|save/i })
  );

  await expect(page.getByRole("row", { name: new RegExp(updatedName) })).toBeVisible();
});
