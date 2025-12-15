const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

async function clickFirstVisible(...locators) {
  const deadline = Date.now() + 15000;
  let lastError = "";

  while (Date.now() < deadline) {
    for (const loc of locators) {
      try {
        if (await loc.isVisible()) {
          await loc.click();
          return;
        }
      } catch (e) {
        lastError = String(e);
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  throw new Error("None of the provided locators were visible after 15s.\n" + lastError);
}

// Opens Quick Links reliably even if sidebar is collapsed or Quick Links is link/button/text
async function openQuickLinks(page) {
  await page.waitForLoadState("domcontentloaded");

  
  await clickFirstVisible(
    page.getByRole("button", { name: /menu|navigation|sidebar|open/i }),
    page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]').first()
  ).catch(() => {});

  const quickLinksCandidates = [
    page.getByRole("link", { name: /quick links/i }),
    page.getByRole("button", { name: /quick links/i }),
    page.getByText(/quick links/i).first(),
  ];

  
  try {
    await clickFirstVisible(...quickLinksCandidates);
    return;
  } catch (_) {
    
    await clickFirstVisible(
      page.getByText(/quick apps/i).first(),
      page.locator('button:has-text("Quick Apps")').first(),
      page.locator('[role="button"]:has-text("Quick Apps")').first()
    ).catch(() => {});
  }

  
  await clickFirstVisible(...quickLinksCandidates);
}

test("C5HOF-2: Edit Link", async ({ page }) => {
  test.setTimeout(60000);

  await loginIfNeeded(page);

  // Go to Quick Links page
  await openQuickLinks(page);

  // Ensure Quick Links page is ready
  await page
    .getByRole("button", { name: /new link/i })
    .waitFor({ state: "visible", timeout: 20000 });

  const linkName = `EditMe-${Date.now()}`;
  const updatedName = `Edited-${Date.now()}`;

  // Create a link first (so the test is independent)
  await page.getByRole("button", { name: /new link/i }).click();
  await page.getByRole("textbox", { name: /enter link name/i }).fill(linkName);
  await page.getByRole("button", { name: /create link/i }).click();

  // Find the created row
  const row = page.getByRole("row", { name: new RegExp(linkName, "i") });
  await expect(row).toBeVisible({ timeout: 20000 });

  // Open row options/actions/more
  await clickFirstVisible(
    row.getByLabel(/options|actions|more/i),
    row.getByRole("button", { name: /options|actions|more/i }),
    row.locator('button:has-text("...")').first()
  );

  // Click Edit/Rename
  await clickFirstVisible(
    page.getByRole("menuitem", { name: /edit|rename/i }),
    page.getByRole("button", { name: /edit|rename/i }),
    page.getByText(/edit|rename/i).first()
  );

  // Update name and save
  await page.getByRole("textbox", { name: /enter link name/i }).fill(updatedName);

  await clickFirstVisible(
    page.getByRole("button", { name: /update|save/i }),
    page.getByRole("menuitem", { name: /update|save/i }),
    page.getByText(/update|save/i).first()
  );

  // Assert updated row is visible
  await expect(page.getByRole("row", { name: new RegExp(updatedName, "i") })).toBeVisible({
    timeout: 20000,
  });
});
