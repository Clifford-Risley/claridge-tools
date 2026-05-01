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

test("unauthenticated user is redirected away from /admin", async ({ page }) => {
  await page.goto("/admin")
  await expect(page).toHaveURL(/sign-in/)
})

test("Admin dashboard renders for admin user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin")
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible()
  await expect(page.getByText("Admin Mode")).toBeVisible()
  await expect(page.getByText("Add Trusted Email")).toBeVisible()
  await expect(page.getByText("Manage Users")).toBeVisible()
  await expect(page.getByText("Manage Tools")).toBeVisible()
})

test("User search returns results matching query", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin")

  await page.getByRole("searchbox", { name: /search users/i }).fill("Smith")
  // Allow debounce to fire
  await page.waitForTimeout(400)
  await expect(page.getByTestId("admin-user-row").first()).toBeVisible()
  await expect(page.getByText(/users found/i)).toBeVisible()
})

test("Role badges render correctly for search results", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin")

  await page.getByRole("searchbox", { name: /search users/i }).fill("Smith")
  await page.waitForTimeout(400)

  // Anna Smith is admin — green badge
  await expect(page.getByTestId("role-badge-admin")).toBeVisible()
  // David and Jennifer Smith are neighbors — gray badges
  await expect(page.getByTestId("role-badge-neighbor").first()).toBeVisible()
})

test("Empty search shows 'No users found'", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin")

  await page.getByRole("searchbox", { name: /search users/i }).fill("xyzzy no match")
  await page.waitForTimeout(400)
  await expect(page.getByText("No users found")).toBeVisible()
})

test("Invalid email shows validation error in Add Trusted Email", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin")

  await page.getByLabel("Trusted email address").fill("not-an-email")
  await page.getByRole("button", { name: "Add" }).click()
  await expect(page.getByRole("alert")).toBeVisible()
  await expect(page.getByText("Enter a valid email address.")).toBeVisible()
})
