const path = require("path");

// Always load the SAME .env file, even inside Playwright worker processes
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

async function loginIfNeeded(page) {
  const baseURL = process.env.BASE_URL;
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!baseURL) throw new Error("Missing BASE_URL in Playwright/.env");
  if (!email || !password) throw new Error("Missing EMAIL or PASSWORD in Playwright/.env");

  // Go to login page using absolute URL (doesn't depend on baseURL config)
  await page.goto(new URL("/login", baseURL).toString(), { waitUntil: "domcontentloaded" });

  await page.getByPlaceholder(/username, email or phone/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  await page.getByRole("button", { name: /^sign in$/i }).click();

  // Wait until we're NOT on /login anymore (works for SPA apps too)
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 }).catch(() => {});

  // Optional OTP handling (only if your app shows it)
  const otpBox = page.getByRole("textbox", { name: /enter 6-digit code/i });
  if (await otpBox.isVisible().catch(() => false)) {
    const otp = process.env.OTP;
    if (!otp) throw new Error("OTP screen appeared but OTP is missing in Playwright/.env");
    await otpBox.fill(otp);

    // Try common confirm button labels
    await page.getByRole("button", { name: /verify|continue|submit|confirm/i }).click();
    await page.waitForLoadState("domcontentloaded");

  }

  // Final safety: if still on login, fail with a clear message
  if (page.url().includes("/login")) {
    throw new Error("Login did not complete (still on /login). Check credentials/OTP/selectors.");
  }
}

module.exports = { loginIfNeeded };
