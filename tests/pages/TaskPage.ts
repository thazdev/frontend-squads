// pages/TaskPage.ts
import { expect, type Page } from "@playwright/test";

export class TaskPage {
  constructor(private readonly page: Page) {}

  async openKanban() {
    await this.page.goto("/kanban");
    await this.page.waitForLoadState("networkidle");
  }

  async create(title: string, squad: string) {
    await this.page.getByTestId("open-create-task").click();
    await this.page.getByTestId("task-desc").waitFor({ state: "visible" });

    await this.page.getByTestId("task-squad").selectOption({ label: squad });
    await this.page.getByTestId("task-title").fill(title);
    await this.page.getByTestId("task-desc").fill("Descrição via teste");
    await this.page.getByTestId("task-priority").selectOption("HIGH");

    await Promise.all([
      this.page.waitForSelector('[data-testid="open-create-task"]', {
        state: "visible",
      }),
      this.page.getByTestId("save-task").click(),
    ]);

    await expect(this.page.getByTestId(`kanban-task-${title}`)).toBeVisible();
  }
}
