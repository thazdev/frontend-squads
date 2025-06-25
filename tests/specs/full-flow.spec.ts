import { test } from "@playwright/test";
import { CollaboratorPage } from "../pages/CollaboratorPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RegisterPage } from "../pages/RegisterPage";
import { SquadPage } from "../pages/SquadPage";
import { TaskPage } from "../pages/TaskPage";

test("fluxo completo com colaborador, squad, task e edição de perfil", async ({
  page,
}) => {
  const timestamp = Date.now();

  const register = new RegisterPage(page);
  await register.open();
  await register.registerRandom();

  const collabName = `Colaborador ${timestamp}`;
  const collabEmail = `colab+${timestamp}@teste.com`;
  const collaborator = new CollaboratorPage(page);
  await collaborator.open();
  await collaborator.create(collabName, collabEmail);

  const squadName = `Squad QA ${timestamp}`;
  const squads = new SquadPage(page);
  await squads.openNav();
  await squads.create(squadName);

  await squads.addMemberToSquad(squadName, collabName);

  const taskTitle = `Task QA ${timestamp}`;
  const tasks = new TaskPage(page);
  await tasks.openKanban();
  await tasks.create(taskTitle, squadName);

  const profile = new ProfilePage(page);
  await profile.open();
  await profile.editName(`Novo Nome ${timestamp}`);
});
