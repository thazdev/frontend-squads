/* tests/pages/RegisterPage.ts */
import { type Page } from "@playwright/test";

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/register");
    await this.page.waitForLoadState("networkidle");
  }

  /** Envia formulário; se email não vier, gera um novo. */
  async submit(email?: string) {
    const ts   = Date.now();
    const eml  = email ?? `qa+${ts}@teste.com`;
    const pwd  = "123456";

    await this.page.getByPlaceholder("Nome").fill("QA Bot");
    await this.page.getByPlaceholder("Email").fill(eml);
    await this.page.getByPlaceholder("Senha").first().fill(pwd);
    await this.page.getByPlaceholder("Senha").nth(1).fill(pwd);

    const [response] = await Promise.all([
      this.page.waitForResponse((res) => {
        if (!res.url().includes("/graphql")) return false;
    
        const body = res.request().postData();      
        return !!body && body.includes("register");   
      }),
      this.page.getByRole("button", { name: /cadastrar/i }).click(),
    ]);
    

    const json = await response.json();
    return { email: eml, json };
  }
}
