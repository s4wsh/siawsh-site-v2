// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('@smoke', () => {
  test('projects index renders cards', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveTitle(/Projects/);
    const cards = page.locator('a[href^="/projects/"]');
    await expect(cards.first()).toBeVisible();
  });

  test('project detail loads with hero and gallery', async ({ page }) => {
    await page.goto('/projects');
    const first = page.locator('a[href^="/projects/"]').first();
    const href = await first.getAttribute('href');
    await first.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('img')).toBeVisible();
    // JSON-LD and meta
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeVisible();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('blog index and detail render', async ({ page }) => {
    await page.goto('/blog');
    const cards = page.locator('a[href^="/blog/"]');
    await expect(cards.first()).toBeVisible();
    const href = await cards.first().getAttribute('href');
    await cards.first().click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator('h1')).toBeVisible();
    // TOC: anchors should exist in content
    await expect(page.locator('article a[href^="#"]').first()).toBeVisible();
    // JSON-LD and meta
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeVisible();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('unknown project slug returns 404', async ({ page }) => {
    const res = await page.goto('/projects/does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
