import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/specs",
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    browserName: "chromium",
    headless: true,
    video: "on",
    screenshot: "only-on-failure",
  },
});
