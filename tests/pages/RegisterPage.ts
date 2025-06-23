import { type Page } from "@playwright/test";

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/register");
  }

  async registerRandom() {
    const ts = Date.now();
    const email = `qa+${ts}@teste.com`;
    const pwd = "123456";

    await this.page.getByPlaceholder("Nome").fill("QA Bot");
    await this.page.getByPlaceholder("Email").fill(email);
    await this.page.getByPlaceholder("Senha").first().fill(pwd);
    await this.page.getByPlaceholder("Senha").nth(1).fill(pwd);
    await this.page.getByRole("button", { name: /cadastrar/i }).click();

    await this.page.waitForURL("**/collaborators");

    return { email };
  }
}
