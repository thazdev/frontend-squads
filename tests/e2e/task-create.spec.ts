import { expect, test } from "@playwright/test";
import { createSquad } from "../utils/createSquad";
import { registerUser } from "../utils/registerUser";

test("fluxo completo: registra, cria squad e task", async ({ page }) => {
  const ts = Date.now();
  const taskTitle = `Task QA ${ts}`;

  // Registro
  await registerUser(page);

  // Cria squad pela UI
  const squadName = await createSquad(page);

  // Vai para kanban
  await page.goto("/kanban");
  await page.waitForLoadState("networkidle");

  // abre modal
  await page.getByTestId("open-create-task").click();
  await expect(page.getByTestId("task-desc")).toBeVisible();

  // seleciona squad
  const squadSelect = page.getByTestId("task-squad");
  await squadSelect.selectOption({ label: squadName });

  // preenche
  await page.getByTestId("task-title").fill(taskTitle);
  await page.getByTestId("task-desc").fill("descrição via playwright");
  await page.getByTestId("task-priority").selectOption("HIGH");

  // salva
  await Promise.all([
    page.waitForSelector('[data-testid="open-create-task"]', {
      state: "visible",
    }),
    page.getByTestId("save-task").click(),
  ]);

  // valida task
  await expect(page.getByTestId(`kanban-task-${taskTitle}`)).toBeVisible();
});
