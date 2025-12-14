async function loginIfNeeded(page) {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  if (!email || !password) throw new Error("Missing EMAIL or PASSWORD in Playwright/.env");

  await page.goto("/login");

  await page.getByPlaceholder(/username, email or phone/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(process.env.PASSWORD);

  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForLoadState("networkidle");
}

module.exports = { loginIfNeeded };
