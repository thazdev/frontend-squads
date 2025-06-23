import { test } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";
import { SquadPage } from "../pages/SquadPage";

test("cria um squad", async ({ page }) => {
  const reg = new RegisterPage(page);
  await reg.open();
  await reg.registerRandom();

  const squad = new SquadPage(page);
  const name = `Squad QA ${Date.now()}`;
  await squad.openNav();
  await squad.create(name);
});
