import { test, expect } from "@playwright/test"
import { signInWithEmail } from "./helpers/auth"

function requireCreds() {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) {
    throw new Error("Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD before running e2e tests")
  }
  return { email, password }
}

test("Bottom nav renders on My Account screen", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible()
})

test("Admin badge visible in profile card for admin user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")
  // This test expects E2E_TEST_EMAIL to belong to an admin account
  await expect(page.getByTestId("admin-badge")).toBeVisible()
})

test("Admin badge not visible for neighbor user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")
  // This test expects E2E_TEST_EMAIL to belong to a neighbor account
  // The badge is always scoped to the profile card so it can't bleed in from elsewhere
  await expect(
    page.getByTestId("profile-card").getByTestId("admin-badge"),
  ).not.toBeVisible()
})

test("Admin tab not visible in bottom nav for neighbor user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")
  // This test expects a non-admin test account
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Admin" }),
  ).not.toBeVisible()
})
