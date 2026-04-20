import { test, expect } from "@playwright/test";

test("jobs page renders running status and progress in mock mode", async ({ page }) => {
  await page.route("**/api/users/me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          login: "devpilot-user",
          role: "admin"
        }
      })
    });
  });

  await page.route("**/api/workers**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: [] })
    });
  });

  await page.route("**/api/jobs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          jobs: [
            {
              id: 101,
              repoFullName: "acme/repo",
              status: "processing",
              uiStatus: "running",
              progress: 42,
              prNumber: 12,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      })
    });
  });

  await page.goto("/jobs");

  await expect(page.getByText("Live Review Queue")).toBeVisible();
  await expect(page.getByText("running")).toBeVisible();
  await expect(page.getByText("acme/repo")).toBeVisible();
});
