import { test, expect } from "@playwright/test";

test("home page loads and shows JUCSO branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(page.getByText("JUCSO", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Student Portal/i })).toBeVisible();
});

test("public track complaint page is reachable", async ({ page }) => {
  await page.goto("/track");
  await expect(page.getByLabel("Tracking ID")).toBeVisible();
  await expect(page.getByRole("button", { name: /Track complaint/i })).toBeVisible();
});
