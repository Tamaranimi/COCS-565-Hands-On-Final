const { chromium } = require("@playwright/test");

module.exports = async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(process.env.BASE_URL + "/login");

  await page.getByRole("button", { name: /continue with google/i }).click();

  // Finish Google login manually in the opened window(s).
  // Once you’re back in the app and can see you're logged in:
  await page.waitForLoadState("networkidle");

  await context.storageState({ path: "Playwright/.auth/storageState.json" });
  await browser.close();
};
