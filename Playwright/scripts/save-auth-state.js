const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

// Load Playwright/.env reliably
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

(async () => {
  const baseURL = process.env.BASE_URL;
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!baseURL) throw new Error("Missing BASE_URL in Playwright/.env");
  if (!email || !password) throw new Error("Missing EMAIL or PASSWORD in Playwright/.env");

  const statePath = path.join(__dirname, "..", "tests", ".auth", "state.json");
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  // headless:false so you can complete OTP once if it appears
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(new URL("/login", baseURL).toString(), { waitUntil: "domcontentloaded" });

  await page.getByPlaceholder(/username, email or phone/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  // If OTP appears, complete it manually in the opened browser window
  const otpBox = page.getByRole("textbox", { name: /enter 6-digit code/i });
  if (await otpBox.isVisible().catch(() => false)) {
    console.log("OTP detected. Enter OTP in the browser window to continue...");
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 120000 });
  } else {
    await page.waitForLoadState("domcontentloaded");
  }

  await context.storageState({ path: statePath });
  await browser.close();

  console.log("✅ Saved auth state to:", statePath);
})().catch((e) => {
  console.error("❌ Failed to save auth state:", e);
  process.exit(1);
});
