import { expect, type Page } from "@playwright/test";

export class SquadPage {
  constructor(private readonly page: Page) {}

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

  async addMemberToSquad(squadName: string, memberName: string) {
    await this.page.getByRole("heading", { name: squadName }).click();

    await this.page.getByTestId("search-member").fill(memberName);

    const addBtn = this.page
      .locator("li", { hasText: memberName })
      .getByTestId("add-member");
    await addBtn.click();

    await this.page.getByTestId("close-modal").click();

    await this.page.getByRole("heading", { name: squadName }).click();
    await expect(this.page.getByText(memberName)).toBeVisible();
    await this.page.getByTestId("close-modal").click();

    await this.page
      .locator('h4:has-text("Membros")')
      .locator("..")
      .getByText(memberName, { exact: true })
      .first()
      .waitFor({ timeout: 2000 })
      .catch(() => {});
  }
}
