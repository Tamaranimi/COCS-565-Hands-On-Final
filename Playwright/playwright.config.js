const path = require("path");
const { defineConfig } = require("@playwright/test");

// Load Playwright/.env reliably for config
require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
    storageState: path.join(__dirname, "tests", ".auth", "state.json"),
  },
});
