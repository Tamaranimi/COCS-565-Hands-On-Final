describe("C5HOF-7: Edit Link (Cypress)", () => {
  beforeEach(() => {
    cy.loginGrabDocs();
    cy.openLinksApp();
  });

  it("C5HOF-7 Edit Link", () => {
    const linkName = `CYP-Edit-${Date.now()}`;
    const updatedName = `CYP-Edited-${Date.now()}`;

    // Create first
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

    // Open Options/More inside the row
    cy.contains("tr", linkName).within(() => {
      cy.contains(/options|actions|more/i).click({ force: true });
    });
    cy.slow();

    // Click Edit/Rename
    cy.contains("button, [role='menuitem']", /edit|rename/i).click({ force: true });
    cy.slow();

    // Update name + save
    cy.get('input[placeholder*="Enter link name" i], input[aria-label*="Enter link name" i]')
      .first()
      .clear()
      .type(updatedName, { delay: 30 });

    cy.slow();
    cy.contains("button, [role='menuitem']", /update|save/i).click({ force: true });
    cy.slow();

    cy.contains("tr", updatedName, { timeout: 20000 }).should("be.visible");
    cy.slow();
  });
});
