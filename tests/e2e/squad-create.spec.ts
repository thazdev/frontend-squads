import { expect, test } from "@playwright/test";

test("fluxo completo: registra, loga e cria squad", async ({ page }) => {
  const ts = Date.now();
  const email = `qa+${ts}@teste.com`;

  await page.goto("/register");

  await page.getByPlaceholder("Nome").fill("QA Bot");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Senha").nth(0).fill("123456"); // senha
  await page.getByPlaceholder("Senha").nth(1).fill("123456"); // confirmar senha
  await page.getByRole("button", { name: /cadastrar/i }).click();

  // espera redirecionamento automático pós-cadastro
  await page.waitForURL("**/collaborators");

  // aguarda token salvo → prova de login
  await page.waitForFunction(() => !!localStorage.getItem("token"), null, {
    timeout: 5000,
  });

  // aguarda navbar renderizar
  await page.getByTestId("nav-squads").waitFor({ state: "attached" });

  /* --------- NAVEGA ATÉ SQUADS --------- */
  await page.getByTestId("nav-squads").click();
  await expect(page).toHaveURL(/\/squads/);

  /* --------- CRIA O SQUAD --------- */
  await page.getByTestId("open-create-squad").click();

  const squadName = `Squad QA ${ts}`;
  await page.getByTestId("squad-name").first().fill(squadName);
  await page
    .getByTestId("squad-description")
    .first()
    .fill("Criado via Playwright");
  await page.getByTestId("squad-goal").first().fill("Cobrir e2e 100%");
  await page.waitForSelector('[data-testid="save-squad"]', {
    state: "visible",
  });

  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="save-squad"]');
    if (btn instanceof HTMLElement) btn.click();
  });

  await expect(page.getByRole("heading", { name: squadName })).toBeVisible({
    timeout: 10000,
  });
});
