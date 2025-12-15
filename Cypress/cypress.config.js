const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://app.grabdocs.com",
    supportFile: "cypress/support/e2e.js",

    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,

    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
