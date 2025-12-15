const SLOW = () => Number(Cypress.env("SLOWMO_MS") ?? 800);

Cypress.Commands.add("slow", (ms) => cy.wait(ms ?? SLOW()));

const EMAIL_SELECTORS = [
  'input[type="email"]',
  'input[name*="email" i]',
  'input[id*="email" i]',
  'input[placeholder*="email" i]',
  'input[autocomplete="username"]',
  'input[name*="username" i]',
  'input[placeholder*="username" i]',
];

const PASS_SELECTORS = [
  'input[type="password"]',
  'input[name*="password" i]',
  'input[id*="password" i]',
  'input[placeholder*="password" i]',
];

const OTP_SINGLE_SELECTORS = [
  'input[autocomplete="one-time-code"]',
  'input[name*="otp" i]',
  'input[id*="otp" i]',
  'input[placeholder*="otp" i]',
  'input[placeholder*="code" i]',
  'input[inputmode="numeric"]',
];

function firstVisible(selectors, timeout = 20000) {
  return cy.get(selectors.join(","), { timeout }).filter(":visible").first();
}

function fillOtp(code) {
  const otp = String(code);

  // Try a single OTP input first
  return cy.get("body").then(($body) => {
    const hasSingle =
      $body.find(OTP_SINGLE_SELECTORS.join(",")).filter(":visible").length > 0;

    if (hasSingle) {
      return firstVisible(OTP_SINGLE_SELECTORS, 20000)
        .clear()
        .type(otp, { log: false, delay: 40 });
    }

    // Otherwise try 6 separate boxes (common OTP UI)
    const $inputs = $body.find("input:visible");
    const $boxes = $inputs.filter((_, el) => {
      const ml = el.maxLength;
      const im = (el.getAttribute("inputmode") || "").toLowerCase();
      return ml === 1 || im === "numeric";
    });

    if ($boxes.length >= 6) {
      const digits = otp.padStart(6, "0").slice(0, 6).split("");
      digits.forEach((d, i) => {
        cy.wrap($boxes.eq(i)).clear().type(d, { log: false, delay: 40 });
      });
      return;
    }

    throw new Error("Could not find OTP input(s). Update OTP selectors for GrabDocs.");
  });
}

Cypress.Commands.add("loginGrabDocs", () => {
  const email = Cypress.env("EMAIL");
  const password = Cypress.env("PASSWORD");
  const otp = Cypress.env("OTP");

  if (!email || !password) {
    throw new Error("Missing EMAIL or PASSWORD in cypress.env.json");
  }

  const loginFlow = () => {
    cy.visit("/login");
    cy.slow();

    firstVisible(EMAIL_SELECTORS, 20000).clear().type(email, { delay: 20 });
    cy.slow(200);

    firstVisible(PASS_SELECTORS, 20000).clear().type(password, { delay: 20, log: false });
    cy.slow(200);

    cy.contains("button", /sign in|log in|login/i, { timeout: 20000 })
      .should("be.enabled")
      .click();

    // Wait until one of these is true: Quick Apps (logged in), OTP screen, or error text
    cy.get("body", { timeout: 30000 }).should(($body) => {
      const text = $body.text().toLowerCase();

      const hasQuickApps = text.includes("quick apps");
      const hasOtp =
        /otp|verification|two[- ]factor|2fa|6[- ]digit|code/.test(text) ||
        $body.find(OTP_SINGLE_SELECTORS.join(",")).filter(":visible").length > 0;

      const hasError = /invalid|incorrect|wrong|failed|error/.test(text);

      expect(hasQuickApps || hasOtp || hasError, "post-login state").to.eq(true);
    });

    // If OTP is present, fill it + verify
    cy.get("body").then(($body) => {
      const text = $body.text().toLowerCase();

      const hasQuickApps = text.includes("quick apps");
      const hasError = /invalid|incorrect|wrong|failed|error/.test(text);
      const hasOtp =
        /otp|verification|two[- ]factor|2fa|6[- ]digit|code/.test(text) ||
        $body.find(OTP_SINGLE_SELECTORS.join(",")).filter(":visible").length > 0;

      if (hasError && !hasQuickApps) {
        throw new Error(
          "Login failed (invalid credentials/blocked). Check the Cypress screenshot for the exact message."
        );
      }

      if (hasOtp && !hasQuickApps) {
        if (!otp) throw new Error("OTP screen detected but OTP is missing in cypress.env.json");

        fillOtp(otp);
        cy.slow(200);

        cy.contains("button", /verify|continue|submit|confirm/i, { timeout: 20000 })
          .click({ force: true });
      }
    });

    // Final proof of login
    cy.contains("button", /quick apps/i, { timeout: 60000 }).should("be.visible");
  };

  // Use session if available
  if (typeof cy.session === "function") {
    cy.session([email], loginFlow, { cacheAcrossSpecs: true });
  } else {
    loginFlow();
  }
});

// Keep your old name working (if any spec calls it)
Cypress.Commands.add("loginWithOtp", () => {
  cy.loginGrabDocs();
});

// ✅ Add this so cy.openLinksApp() exists
Cypress.Commands.add("openLinksApp", () => {
  // Ensure we are logged in first
  cy.contains("button", /quick apps/i, { timeout: 60000 }).should("be.visible");

  // Quick Apps -> Links
  cy.contains("button", /quick apps/i).click({ force: true });
  cy.slow();

  cy.contains("button", /^links$/i, { timeout: 30000 })
    .should("be.visible")
    .click({ force: true });

  cy.slow();

  // Links page ready
  cy.contains("button", /new link/i, { timeout: 30000 }).should("be.visible");
  cy.slow();
});
