import { test, expect } from '@playwright/test';

test.describe('Landing Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows landing page and routes to dashboard via CTA', async ({ page }) => {
    await expect(page.getByText('Build Reliable HR Workflows')).toBeVisible();
    await page.getByTestId('cta-go-dashboard').click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Architect Dashboard' })).toBeVisible();
  });

  test('routes to workflows via secondary CTA', async ({ page }) => {
    await page.getByTestId('cta-explore-workflows').click();
    await expect(page).toHaveURL(/\/workflows$/);
    await expect(page.getByRole('heading', { name: 'Workflow Designer' })).toBeVisible();
  });
});
