import type { Page } from "@playwright/test";

export async function signInWithEmail(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/sign-in");
  await page.getByLabel(/email address/i).fill(email);
  await page.getByRole("textbox", { name: /password/i }).fill(password);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForURL("**/directory");
}
