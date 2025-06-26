import { test, expect } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

let reusedEmail = "";

test.describe("@smoke", () => {
  test("registration-ok", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.open();
    const res = await reg.submit();          // e-mail novo
    reusedEmail = res.email;

    expect(res.json.errors).toBeFalsy();
    expect(res.json.data.register.token).toBeTruthy();
  });

  // ← sem test.fail() → falha conta como erro real
  test("registration-duplicate", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.open();
    const res = await reg.submit(reusedEmail); // mesmo e-mail

    // força erro (vai receber errors[])
    expect(res.json.errors).toBeFalsy();
  });
});
