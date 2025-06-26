/* tests/pages/RegisterPage.ts */

import { type Page } from "@playwright/test";

export class RegisterPage {
  constructor(private readonly page: Page) {}

  /** Abre a rota /register e espera a página ficar ociosa. */
  async open() {
    await this.page.goto("/register");
    await this.page.waitForLoadState("networkidle");
  }

  /** Preenche o formulário com dados randômicos e valida o redirecionamento. */
  async registerRandom() {
    const ts   = Date.now();
    const email = `qa+${ts}@teste.com`;
    const pwd   = "123456";

    /* ── Preenche inputs ── */
    await this.page.getByPlaceholder("Nome").fill("QA Bot");
    await this.page.getByPlaceholder("Email").fill(email);
    await this.page.getByPlaceholder("Senha").first().fill(pwd);
    await this.page.getByPlaceholder("Senha").nth(1).fill(pwd);

    /* ── Log de cada request GraphQL de register (debug) ── */
    this.page.on("request", (req) => {
      if (req.url().includes("/graphql") && req.method() === "POST") {
        const body = req.postData();
        if (body && (body.includes("register") || body.includes("Register"))) {
          console.log("DEBUG: Corpo da requisição:", body);
          console.log("DEBUG: Headers:", req.headers());
          console.log("DEBUG: URL:", req.url());
        }
      }
    });

    /* ── Envia mutation e captura resposta ── */
    const [response] = await Promise.all([
      this.page.waitForResponse((res) => {
        if (!res.url().includes("/graphql") || res.request().method() !== "POST") return false;
        const body = res.request().postData();
        return !!body && (body.includes("register") || body.includes("Register"));
      }),
      this.page.getByRole("button", { name: /cadastrar/i }).click(),
    ]);

    /* ── Verifica HTTP e GraphQL ── */
    if (response.status() !== 200) {
      throw new Error(`Registro falhou (HTTP ${response.status()}): ${await response.text()}`);
    }
    const json = await response.json();
    if (json.errors?.length) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }
    console.log("✅ Registro respondeu com sucesso:", json);

    /* ── Aguarda redirecionamento ── */
    try {
      await this.page.waitForURL(/collaborators/i, { timeout: 90_000 });
      console.log("URL após waitForURL:", this.page.url());
    } catch {
      console.log("❌ Timeout esperando URL. URL atual:", this.page.url());
      throw new Error("URL não mudou para /collaborators depois do registro.");
    }

    return { email };
  }
}
