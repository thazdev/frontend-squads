import { test, expect } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

let reusedEmail = "";

test.describe("@smoke", () => {
  test("registration-ok", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.open();
    const res = await reg.submit();   // gera novo e-mail
    reusedEmail = res.email;

    expect(res.json.errors).toBeFalsy();
    expect(res.json.data.register.token).toBeTruthy();
  });

  test("registration-duplicate", async ({ page }) => {
    // 👉 este teste *tem de falhar*
    test.fail(true, "Deve retornar erro de e-mail duplicado");

    const reg = new RegisterPage(page);
    await reg.open();
    const res = await reg.submit(reusedEmail); // mesmo e-mail

    // afirmação contrária -- gera erro
    expect(res.json.errors).toBeFalsy();
  });
});
