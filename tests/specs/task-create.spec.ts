import { test } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";
import { SquadPage } from "../pages/SquadPage";
import { TaskPage } from "../pages/TaskPage";

test("cria task vinculada a squad", async ({ page }) => {
  const reg = new RegisterPage(page);
  await reg.open();
  await reg.registerRandom();

  const squadName = `Squad QA ${Date.now()}`;
  const squads = new SquadPage(page);
  await squads.openNav();
  await squads.create(squadName);

  const tasks = new TaskPage(page);
  await tasks.openKanban();
  await tasks.create(`Task QA ${Date.now()}`, squadName);
});
