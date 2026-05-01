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

test("Edit Profile modal opens from My Account", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  await page.getByRole("button", { name: /edit your profile/i }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Edit Profile" })).toBeVisible()
})

test("Email field is disabled and not editable", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  await page.getByRole("button", { name: /edit your profile/i }).click()
  await expect(page.getByRole("dialog")).toBeVisible()

  const emailInput = page.getByLabel("Email Address")
  await expect(emailInput).toBeDisabled()
})

test("Save blocked when name is empty", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  await page.getByRole("button", { name: /edit your profile/i }).click()
  await expect(page.getByRole("dialog")).toBeVisible()

  await page.getByLabel("Full Name").clear()
  await page.getByRole("button", { name: /save changes/i }).click()

  await expect(page.getByRole("alert")).toBeVisible()
  await expect(page.getByText("Full name is required.")).toBeVisible()
  // Modal stays open
  await expect(page.getByRole("dialog")).toBeVisible()
})

test("Unsaved changes trigger warning on close", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  await page.getByRole("button", { name: /edit your profile/i }).click()
  await expect(page.getByRole("dialog")).toBeVisible()

  // Make a change to mark the form dirty
  await page.getByLabel("Phone Number").fill("555-0199")

  // Intercept the confirm dialog, then dismiss it (user cancels)
  const dialogPromise = page.waitForEvent("dialog")
  await page.getByRole("button", { name: "Close" }).click()
  const confirmDialog = await dialogPromise
  expect(confirmDialog.type()).toBe("confirm")
  await confirmDialog.dismiss()

  // Modal should still be open because user cancelled
  await expect(page.getByRole("dialog")).toBeVisible()
})

test("Admin Access toggle visible for admin user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  await page.getByRole("button", { name: /edit your profile/i }).click()
  await expect(page.getByRole("dialog")).toBeVisible()

  // Assumes E2E_TEST_EMAIL is an admin account
  await expect(page.getByTestId("admin-access-toggle")).toBeVisible()
})

test("Admin Access toggle not visible for neighbor user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-account")

  await page.getByRole("button", { name: /edit your profile/i }).click()
  await expect(page.getByRole("dialog")).toBeVisible()

  // Assumes E2E_TEST_EMAIL is a neighbor (non-admin) account
  await expect(page.getByTestId("admin-access-toggle")).not.toBeVisible()
})
