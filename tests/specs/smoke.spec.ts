/* tests/specs/smoke.spec.ts */
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

let reusedEmail = "";

test.describe("@smoke", () => {
  test("registration-ok", async ({ page }) => {
    const reg  = new RegisterPage(page);
    await reg.open();
    const res  = await reg.submit();     // gera email novo
    reusedEmail = res.email;

    expect(res.json.errors).toBeFalsy();
    expect(res.json.data.register.token).toBeTruthy();
  });

  test("registration-duplicate", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.open();
    const res = await reg.submit(reusedEmail);  // usa MESMO email

    // *** ASSERT propositalmente errado para demonstrar falha ***
    expect(res.json.errors).toBeFalsy();        // vai falhar
  });
});
