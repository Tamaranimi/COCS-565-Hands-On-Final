const { test, expect } = require("@playwright/test");
const { loginIfNeeded } = require("./helpers/auth");

// Allow clipboard copy verification
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

// ✅ Slow down so a viewer can see each step
const SLOW = Number(process.env.SLOWMO_MS || 800);
const pause = (page, ms = SLOW) => page.waitForTimeout(ms);

// ✅ Click the first locator that becomes visible (polls up to 15s)
async function clickFirstVisible(...locators) {
  const deadline = Date.now() + 15000;

  while (Date.now() < deadline) {
    for (const loc of locators) {
      try {
        if (await loc.isVisible()) {
          await loc.click();
          return;
        }
      } catch (_) {}
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  throw new Error("None of the provided locators were visible after 15s.");
}

// ✅ Your UI: Quick Apps (button) → Links (button)
async function openLinks(page) {
  await page.waitForLoadState("domcontentloaded");
  await pause(page);

  // Open Quick Apps
  const quickAppsBtn = page.getByRole("button", { name: /quick apps/i });
  if (await quickAppsBtn.isVisible().catch(() => false)) {
    await quickAppsBtn.click().catch(() => {});
    await pause(page);
  }

  // Click Links (it's a BUTTON in your snapshot)
  await clickFirstVisible(
    page.getByRole("button", { name: /^links$/i }),
    page.getByRole("button", { name: /links/i }),
    page.getByRole("link", { name: /links/i }),
    page.getByText(/^links$/i).first()
  );

  // Wait until Links page is ready
  await page.getByRole("button", { name: /new link/i }).waitFor({
    state: "visible",
    timeout: 20000,
  });

  await pause(page);
}

test("C5HOF-1 Create Link + Copy Link", async ({ page }) => {
  test.setTimeout(90000);

  // ✅ Login (OTP handled by your helpers/auth.js using .env)
  await loginIfNeeded(page);
  await pause(page);

  // ✅ Navigate: Quick Apps → Links
  await openLinks(page);

  const linkName = `Test5-${Date.now()}`;

  // Create link
  await page.getByRole("button", { name: /new link/i }).click();
  await pause(page);

  await page.getByRole("textbox", { name: /enter link name/i }).fill(linkName);
  await pause(page);

  await page.getByRole("button", { name: /create link/i }).click();
  await pause(page);

  // Confirm row exists
  const row = page.getByRole("row", { name: new RegExp(linkName, "i") });
  await expect(row).toBeVisible({ timeout: 20000 });
  await pause(page);

  // Open options/actions menu
  await clickFirstVisible(
    row.getByLabel(/options|actions|more/i),
    row.getByRole("button", { name: /options|actions|more/i }),
    row.locator('button:has-text("...")').first()
  );
  await pause(page);

  // Share
  await clickFirstVisible(
    page.getByRole("button", { name: /^share$/i }),
    page.getByRole("menuitem", { name: /^share$/i }),
    page.getByText(/^share$/i).first()
  );
  await pause(page);

  // Copy Link
  await clickFirstVisible(
    page.getByRole("button", { name: /copy link/i }),
    page.getByRole("menuitem", { name: /copy link/i }),
    page.getByText(/copy link/i).first()
  );
  await pause(page);

  // Verify clipboard content
  const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
  await expect(shareUrl).toMatch(/^https?:\/\//);
  console.log("Copied share URL:", shareUrl);

  await pause(page);
});
