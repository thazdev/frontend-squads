import { type Page, expect } from "@playwright/test";

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/profile");
  }

  async editName(newName: string) {
    await this.page.getByTestId("edit-profile").click();

    const inputs = this.page.locator('input:not([type="file"])');
    await inputs.first().waitFor({ state: "visible" });

    await inputs.first().fill("");
    await inputs.first().type(newName);

    await this.page.getByRole("button", { name: /salvar/i }).click();

    await expect(this.page.getByText(newName)).toBeVisible();
  }
}
