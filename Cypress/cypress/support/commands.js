// cypress/support/commands.js

const SLOW = () => Number(Cypress.env("SLOWMO_MS") ?? 800);

Cypress.Commands.add("slow", (ms) => {
  cy.wait(ms ?? SLOW());
});

// Helper: get the first visible match from a list of selectors
function firstVisible(selectors, timeout = 20000) {
  return cy.get(selectors.join(","), { timeout }).filter(":visible").first();
}

// Main login (this is what your spec is calling)
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

    // Email/Username field (robust selectors)
    firstVisible(
      [
        'input[type="email"]',
        'input[name="email"]',
        'input[id*="email" i]',
        'input[autocomplete="username"]',
        'input[name="username"]',
        'input[id*="user" i]',
        'input',
      ],
      20000
    )
      .clear()
      .type(email, { delay: 20 });

    cy.slow(200);

    // Password field
    firstVisible(
      ['input[type="password"]', 'input[name="password"]', 'input[id*="password" i]'],
      20000
    )
      .clear()
      .type(password, { delay: 20, log: false });

    cy.slow(200);

    cy.contains("button", /sign in|log in|login/i, { timeout: 20000 }).click();
    cy.slow();

    // OTP (only if the page shows OTP-related text)
    cy.get("body", { timeout: 20000 }).then(($body) => {
      const txt = $body.text().toLowerCase();
      const otpScreen = /otp|verification|2fa|two[- ]factor|6[- ]digit|code/.test(txt);

      if (otpScreen) {
        if (!otp) throw new Error("OTP screen detected but OTP is missing in cypress.env.json");

        firstVisible(
          [
            'input[autocomplete="one-time-code"]',
            'input[inputmode="numeric"]',
            'input[name*="otp" i]',
            'input[id*="otp" i]',
            'input[placeholder*="code" i]',
            'input',
          ],
          20000
        )
          .clear()
          .type(String(otp), { delay: 50, log: false });

        cy.slow(200);
        cy.contains("button", /verify|continue|submit|confirm/i, { timeout: 20000 }).click();
        cy.slow();
      }
    });

    // Confirm we are not stuck on login
    cy.location("pathname", { timeout: 30000 }).should("not.include", "/login");
  };

  // Use cy.session if available (faster + stable across tests); otherwise run normal login
  if (typeof cy.session === "function") {
    cy.session([email, password], loginFlow, { cacheAcrossSpecs: true });
  } else {
    loginFlow();
  }
});

// Keep your old command name working too
Cypress.Commands.add("loginWithOtp", () => {
  cy.loginGrabDocs();
});

Cypress.Commands.add("openLinksApp", () => {
  cy.contains("button", /quick apps/i, { timeout: 20000 }).should("be.visible").click({ force: true });
  cy.slow();

  cy.contains("button", /^links$/i, { timeout: 20000 }).should("be.visible").click({ force: true });
  cy.slow();

  cy.contains("button", /new link/i, { timeout: 20000 }).should("be.visible");
  cy.slow();
});
