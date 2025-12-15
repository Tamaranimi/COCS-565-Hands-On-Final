const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

// ✅ Slow down so a viewer can see each step
const SLOW = Number(process.env.SLOWMO_MS || 800);
const pause = (page, ms = SLOW) => page.waitForTimeout(ms);

// ✅ Click the first locator that becomes visible (polls up to 15s)
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

// ✅ Your UI: Quick Apps (button) → Links (button)
async function openLinks(page) {
  await page.waitForLoadState("domcontentloaded");
  await pause(page);

  const quickAppsBtn = page.getByRole("button", { name: /quick apps/i });
  if (await quickAppsBtn.isVisible().catch(() => false)) {
    await quickAppsBtn.click().catch(() => {});
    await pause(page);
  }

  await clickFirstVisible(
    page.getByRole("button", { name: /^links$/i }),
    page.getByRole("button", { name: /links/i }),
    page.getByRole("link", { name: /links/i }),
    page.getByText(/^links$/i).first()
  );

  await pause(page);
}

test("C5HOF-3: Delete Link", async ({ page }) => {
  test.setTimeout(90000);

  await loginIfNeeded(page);
  await pause(page);

  await openLinks(page);

  const linkName = `DeleteMe-${Date.now()}`;

  // Wait for Links page to be ready
  await page.getByRole("button", { name: /new link/i }).waitFor({
    state: "visible",
    timeout: 20000,
  });
  await pause(page);

  // Create link first
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

  // Click Delete/Remove
  await clickFirstVisible(
    page.getByRole("menuitem", { name: /delete|remove/i }),
    page.getByRole("button", { name: /delete|remove/i }),
    page.getByText(/^delete$|^remove$/i).first()
  );
  await pause(page);

  // Confirm modal (if shown)
  await clickFirstVisible(
    page.getByRole("button", { name: /^delete$/i }),
    page.getByRole("button", { name: /confirm/i }),
    page.getByRole("button", { name: /yes/i })
  ).catch(() => {});
  await pause(page);

  await expect(page.getByRole("row", { name: new RegExp(linkName, "i") })).toHaveCount(0, {
    timeout: 20000,
  });
  await pause(page);
});
