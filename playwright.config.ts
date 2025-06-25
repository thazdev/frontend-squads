import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/specs",
  timeout: 30_000,
  retries: 1,
  use: {
    headless: true,
    screenshot: "only-on-failure",
    video: "on-first-retry",
    trace: "retain-on-failure",
    baseURL: "http://localhost:5173",
  },
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    [
      "html",
      { outputFolder: "test-artifacts/playwright-report", open: "never" },
    ],
  ],
});
