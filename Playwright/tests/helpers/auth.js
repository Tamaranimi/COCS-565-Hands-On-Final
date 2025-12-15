const path = require("path");

// ✅ Force-load Playwright/.env reliably (also works in worker processes)
require("dotenv").config({
  path: path.join(__dirname, "..", "..", "..", ".env"), // Playwright/.env
  override: true,
});

async function loginIfNeeded(page) {
  const baseURL = process.env.BASE_URL;
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  const otp = process.env.OTP || "335577";

  if (!baseURL) throw new Error("Missing BASE_URL in Playwright/.env");
  if (!email || !password) throw new Error("Missing EMAIL or PASSWORD in Playwright/.env");

  // Go to login page (absolute URL so it doesn't depend on baseURL config)
  await page.goto(new URL("/login", baseURL).toString(), { waitUntil: "domcontentloaded" });

  await page.getByPlaceholder(/username, email or phone/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  await page.getByRole("button", { name: /^sign in$/i }).click();

  // ✅ Handle OTP if it appears
  const otpInputCandidates = [
    page.getByRole("textbox", { name: /enter 6-digit code|otp|verification code/i }),
    page.locator('input[autocomplete="one-time-code"]').first(),
    page.locator('input[type="tel"]').first(),
    page.locator('input[name*="otp" i]').first(),
  ];

  let otpFilled = false;
  for (const loc of otpInputCandidates) {
    try {
      await loc.waitFor({ state: "visible", timeout: 8000 });
      await loc.fill(otp);
      otpFilled = true;
      break;
    } catch (_) {}
  }

  if (otpFilled) {
    // Click a confirm button if your UI has one (tries common labels)
    const confirmBtnCandidates = [
      page.getByRole("button", { name: /verify|continue|submit|confirm/i }),
      page.getByRole("button", { name: /next/i }),
    ];

    for (const btn of confirmBtnCandidates) {
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        break;
      }
    }
  }

  // ✅ Wait until login completes (no more /login in URL)
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
  await page.waitForLoadState("domcontentloaded");
}

module.exports = { loginIfNeeded };
