import { expect, test } from "@playwright/test";
import { registerUser } from "../utils/registerUser";

test("usuário consegue logar", async ({ browser }) => {
  // 1. registra novo usuário
  const regPage = await browser.newPage();
  const { email } = await registerUser(regPage);
  await regPage.close();

  const context = await browser.newContext();
  const page = await context.newPage();

  // 3. acessa login e tenta logar
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.locator('input[type="password"]').fill("123456");

  // submete o form manualmente (garante que handleSubmit seja chamado)
  await page
    .getByTestId("login-form")
    .evaluate((form) => (form as HTMLFormElement).requestSubmit());
  page.on("response", async (res) => {
    if (res.url().includes("/graphql")) {
      const body = await res.request().postData();
      const json = await res.json().catch(() => null); // evita crash
      console.log("🔵 GRAPHQL BODY:", body);
      console.log("🔴 GRAPHQL RESPONSE:", json);
    }
  });
  const btn = await page.getByRole("button", { name: /entrar/i });
  console.log("✅ Botão desabilitado?", await btn.isDisabled());

  // 4. espera breve e debuga estado da página
  await page.waitForTimeout(2000);

  const token = await page.evaluate(() => localStorage.getItem("token"));
  const currentUrl = page.url();
  const bodyText = await page.locator("body").innerText();

  console.log("🟢 Token:", token);
  console.log("🟡 URL:", currentUrl);
  console.log("🟠 Texto da página:\n", bodyText);

  // 5. valida que login realmente aconteceu
  expect(token).not.toBeNull();
});
