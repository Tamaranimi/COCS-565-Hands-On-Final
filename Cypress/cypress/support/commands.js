
const SLOW = () => Number(Cypress.env("SLOWMO_MS") || 800);

Cypress.Commands.add("slow", (ms) => {
  cy.wait(ms ?? SLOW());
});

Cypress.Commands.add("loginWithOtp", () => {
  const email = Cypress.env("EMAIL");
  const password = Cypress.env("PASSWORD");
  const otp = Cypress.env("OTP");

  if (!email || !password) throw new Error("Missing EMAIL or PASSWORD in cypress.env.json");
  if (!otp) throw new Error("Missing OTP in cypress.env.json");

  cy.visit("/login");
  cy.slow();

  cy.contains("input, textarea", /username|email|phone/i).then(($el) => {
    cy.wrap($el).clear().type(email, { delay: 20 });
  });

  cy.contains("input, textarea", /password/i).then(($el) => {
    cy.wrap($el).clear().type(password, { delay: 20 });
  });

  cy.contains("button", /sign in/i).click();
  cy.slow();

  // OTP (only if it appears)
  cy.contains("input, textarea", /enter 6-digit code|otp|verification/i, { timeout: 15000 })
    .then(($otp) => {
      cy.wrap($otp).clear().type(otp, { delay: 50 });
      cy.slow();
      cy.contains("button", /verify|verify code|continue|submit/i).click();
      cy.slow();
    })
    .catch(() => {
      // If OTP screen does not appear, continue.
    });
});

Cypress.Commands.add("openLinksApp", () => {
  // Your UI snapshot: Quick Apps (button) -> Links (button)
  cy.contains("button", /quick apps/i).click({ force: true });
  cy.slow();

  cy.contains("button", /^links$/i).click({ force: true });
  cy.slow();

  // Wait for Links page to be ready
  cy.contains("button", /new link/i, { timeout: 20000 }).should("be.visible");
  cy.slow();
});
