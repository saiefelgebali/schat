import { expect, test } from '@playwright/test';

test('unauthenticated index page redirects to /login', async ({ page }) => {
	await page.goto('/');
	expect(page.url().endsWith('/auth/login')).toBeTruthy();
});
