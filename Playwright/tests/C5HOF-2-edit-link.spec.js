const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

// ✅ Slow down so a viewer can see each step
const SLOW = Number(process.env.SLOWMO_MS || 800);
const pause = (page, ms = SLOW) => page.waitForTimeout(ms);

// Waits up to 15s for ANY of the locators to become visible, then clicks the first visible one
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

// ✅ Your UI shows: Quick Apps (button) then Links (button)
async function openLinks(page) {
  await page.waitForLoadState("domcontentloaded");
  await pause(page);

  // If Quick Apps button exists, click it (safe if it just toggles/does nothing)
  const quickAppsBtn = page.getByRole("button", { name: /quick apps/i });
  if (await quickAppsBtn.isVisible().catch(() => false)) {
    await quickAppsBtn.click().catch(() => {});
    await pause(page);
  }

  // In your snapshot, "Links" is a BUTTON in the Quick Apps grid
  await clickFirstVisible(
    page.getByRole("button", { name: /^links$/i }),
    page.getByRole("button", { name: /links/i }),
    page.getByRole("link", { name: /links/i }),
    page.getByText(/^links$/i).first()
  );

  await pause(page);
}

test("C5HOF-2: Edit Link", async ({ page }) => {
  test.setTimeout(90000);

  await loginIfNeeded(page);
  await pause(page);

  await openLinks(page);

  // Wait for Links page to be ready
  await page.getByRole("button", { name: /new link/i }).waitFor({
    state: "visible",
    timeout: 20000,
  });
  await pause(page);

  const linkName = `EditMe-${Date.now()}`;
  const updatedName = `Edited-${Date.now()}`;

  // Create link first (so the test is independent)
  await page.getByRole("button", { name: /new link/i }).click();
  await pause(page);

  await page.getByRole("textbox", { name: /enter link name/i }).fill(linkName);
  await pause(page);

  await page.getByRole("button", { name: /create link/i }).click();
  await pause(page);

  const row = page.getByRole("row", { name: new RegExp(linkName, "i") });
  await expect(row).toBeVisible({ timeout: 20000 });
  await pause(page);

  // Open row options/actions/more
  await clickFirstVisible(
    row.getByLabel(/options|actions|more/i),
    row.getByRole("button", { name: /options|actions|more/i }),
    row.locator('button:has-text("...")').first()
  );
  await pause(page);

  // Click Edit/Rename
  await clickFirstVisible(
    page.getByRole("menuitem", { name: /edit|rename/i }),
    page.getByRole("button", { name: /edit|rename/i }),
    page.getByText(/edit|rename/i).first()
  );
  await pause(page);

  // Update name
  await page.getByRole("textbox", { name: /enter link name/i }).fill(updatedName);
  await pause(page);

  // Save/Update
  await clickFirstVisible(
    page.getByRole("button", { name: /update|save/i }),
    page.getByRole("menuitem", { name: /update|save/i }),
    page.getByText(/update|save/i).first()
  );
  await pause(page);

  await expect(page.getByRole("row", { name: new RegExp(updatedName, "i") })).toBeVisible({
    timeout: 20000,
  });
  await pause(page);
});
