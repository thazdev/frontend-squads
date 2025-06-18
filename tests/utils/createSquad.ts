import { Page, expect } from "@playwright/test";

export async function createSquad(page: Page) {
  const ts = Date.now();
  const squadName = `Squad QA ${ts}`;

  await page.getByTestId("nav-squads").click();
  await page.getByTestId("open-create-squad").click();

  await page.getByTestId("squad-name").first().fill(squadName);
  await page
    .getByTestId("squad-description")
    .first()
    .fill("Squad criado via util");
  await page
    .getByTestId("squad-goal")
    .first()
    .fill("Testar flows via playwright");

  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="save-squad"]');
    if (btn instanceof HTMLElement) btn.click();
  });

  await expect(page.getByRole("heading", { name: squadName })).toBeVisible();
  return squadName;
}
