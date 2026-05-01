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

test("unauthenticated user is redirected away from /my-account", async ({ page }) => {
  await page.goto("/my-account")
  await expect(page).toHaveURL(/sign-in/)
})

test("My Account renders with profile card", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")
  await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible()
  await expect(page.getByTestId("profile-card")).toBeVisible()
})

test("All section rows render with chevrons", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  const labels = [
    "Community Guidelines",
    "Report a User",
    "Send Feedback",
    "Something Not Working?",
    "Terms of Service",
    "Privacy Policy",
  ]
  for (const label of labels) {
    await expect(page.getByRole("link", { name: label })).toBeVisible()
  }
  await expect(page.getByTestId("section-row")).toHaveCount(6)
})

test("Admin badge is not visible for neighbor role", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")
  // Profile card never renders an admin badge for any user on this screen
  await expect(
    page.getByTestId("profile-card").getByText(/admin/i),
  ).not.toBeVisible()
})
