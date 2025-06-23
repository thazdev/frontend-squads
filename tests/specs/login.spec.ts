import { test } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

test("login após registro", async ({ page }) => {
  const reg = new RegisterPage(page);
  await reg.open();
  const { email } = await reg.registerRandom();

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.locator('input[type="password"]').fill("123456");
  await page
    .getByTestId("login-form")
    .evaluate((f) => (f as HTMLFormElement).requestSubmit());

  await test.expect(page).toHaveURL(/collaborators/);
});
