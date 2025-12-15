describe("C5HOF-8: Delete Link (Cypress)", () => {
  beforeEach(() => {
    cy.loginGrabDocs();
    cy.openLinksApp();
  });

  it("C5HOF-8 Delete Link", () => {
    const linkName = `CYP-Delete-${Date.now()}`;

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

    // Delete/Remove
    cy.contains("button, [role='menuitem']", /delete|remove/i).click({ force: true });
    cy.slow();

    // Confirm if modal shows
    cy.get("body").then(($body) => {
      const confirmBtn = $body.find("button:contains('Delete'), button:contains('Confirm'), button:contains('Yes')");
      if (confirmBtn.length > 0) {
        cy.wrap(confirmBtn.first()).click({ force: true });
        cy.slow();
      }
    });

    cy.contains("tr", linkName).should("not.exist");
    cy.slow();
  });
});
