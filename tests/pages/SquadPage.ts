import { expect, type Page } from "@playwright/test";

export class SquadPage {
  constructor(private page: Page) {}

  async openNav() {
    await this.page.getByTestId("nav-squads").click();
  }

  async create(name: string) {
    await this.page.getByTestId("open-create-squad").click();

    await this.page.getByTestId("squad-name").first().fill(name);
    await this.page
      .getByTestId("squad-description")
      .first()
      .fill("Criado via teste");
    await this.page.getByTestId("squad-goal").first().fill("Cobertura e2e");

    await this.page.getByTestId("save-squad").click();
    await expect(this.page.getByRole("heading", { name })).toBeVisible();
  }
}
