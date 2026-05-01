import { test, expect } from "@playwright/test";
import { signInWithEmail } from "./helpers/auth";

test("user can sign in and reach /directory", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD before running e2e tests",
    );
  }

  await signInWithEmail(page, email, password);
  await expect(page).toHaveURL(/\/directory/);
});
