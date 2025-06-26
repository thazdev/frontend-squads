import { type Page, expect } from "@playwright/test";

export class CollaboratorPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/collaborators");
  }

  async create(name: string, email: string) {
    await this.page.getByTestId("open-create-collaborator").click();

    const inputNome = this.page
      .getByText("Nome *")
      .locator("xpath=following-sibling::input");
    await inputNome.fill(name);

    const inputEmail = this.page.locator('input[type="email"]');
    await inputEmail.fill(email);

    await this.page.getByRole("button", { name: /salvar/i }).click();

    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10000 });
  }
}
