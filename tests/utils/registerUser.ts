import { Page } from "@playwright/test";

export async function registerUser(page: Page) {
  const ts = Date.now();
  const email = `qa+${ts}@teste.com`;
  const password = "123456";

  await page.goto("/register");
  await page.getByPlaceholder("Nome").fill("QA Bot");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Senha").nth(0).fill(password);
  await page.getByPlaceholder("Senha").nth(1).fill(password);
  await page.getByRole("button", { name: /cadastrar/i }).click();

  await page.waitForURL("**/collaborators", { timeout: 15000 });
  await page.waitForFunction(() => !!localStorage.getItem("token"), null, {
    timeout: 10000,
  });

  const token = await page.evaluate(() => localStorage.getItem("token"));
  console.log("🔐 TOKEN PÓS-REGISTRO:", token);

  return { token, email };
}
