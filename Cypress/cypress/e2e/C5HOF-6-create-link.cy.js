
describe("C5HOF-6: Create Link (Cypress)", () => {
  beforeEach(() => {
    cy.loginGrabDocs();
    cy.openLinksApp();
  });

  it("C5HOF-6 Create Link", () => {
    const linkName = `CYP-Create-${Date.now()}`;

    cy.contains("button", /new link/i).click();
    cy.slow();

    cy.get('input[placeholder*="Enter link name" i], input[aria-label*="Enter link name" i]')
      .first()
      .type(linkName, { delay: 30 });

    cy.slow();
    cy.contains("button", /create link/i).click();
    cy.slow();

    cy.contains("tr", linkName, { timeout: 20000 }).should("be.visible");
    cy.slow();
  });
});
