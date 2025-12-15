const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });


const { defineConfig } = require("@playwright/test");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });


module.exports = {
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  use: {
    baseURL: process.env.BASE_URL,
    storageState: ".auth/storageState.json",
  },
};


