import { type Page } from "@playwright/test";

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/register");
    await this.page.waitForLoadState("networkidle");
  }

  async registerRandom() {
    const ts = Date.now();
    const email = `qa+${ts}@teste.com`;
    const pwd = "123456";

    await this.page.getByPlaceholder("Nome").fill("QA Bot");
    await this.page.getByPlaceholder("Email").fill(email);
    await this.page.getByPlaceholder("Senha").first().fill(pwd);
    await this.page.getByPlaceholder("Senha").nth(1).fill(pwd);

    this.page.on('request', (request) => {
      if (request.url().includes('/graphql') && request.method() === 'POST') {
        const data = request.postData();
        if (data && (data.includes('register') || data.includes('Register'))) {
          console.log('DEBUG: Corpo da requisição:', data);
          console.log('DEBUG: Headers:', request.headers());
          console.log('DEBUG: URL:', request.url());
        }
      }
    });

    const [response] = await Promise.all([
      this.page.waitForResponse((res) => {
        if (!res.url().includes("/graphql") || res.request().method() !== "POST")
          return false;
        try {
          const body = res.request().postData();
          return !!(body && (body.includes("register") || body.includes("Register")));
        } catch {
          return false;
        }
      }),
      this.page.getByRole("button", { name: /cadastrar/i }).click(),
    ]);
    
    
    if (response.status() !== 200) {
      console.log("❌ Registro falhou:", await response.text());
    } else {
      console.log("✅ Registro respondeu com sucesso.");
    }
    
    console.log("Resposta do registro:", await response.json());
    
    console.log("URL atual antes do waitForURL:", this.page.url());
    await this.page.screenshot({ path: "register-before-wait.png" });

    this.page.on('pageerror', (err) => {
      console.log('Erro JS na página:', err);
    });

    try {
      await this.page.waitForURL(/collaborators/i, { timeout: 60000 });
      console.log("URL após waitForURL:", this.page.url());
    } catch (e) {
      console.log("Timeout esperando URL. URL atual:", this.page.url());
      throw e;
    }
    
    return { email };
  }
}
