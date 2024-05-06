// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';
import {
  ARTICLE_RESUME,
  ARTICLE_TEXT,
  ARTICLE_TITLE,
} from './fixtures/article';

test('write an article', async ({ page }) => {
  await page
    .getByRole('link', {
      name: /new article/i,
    })
    .click();

  await page.getByPlaceholder(/title/i).fill(ARTICLE_TITLE);

  await page
    .getByPlaceholder("What's this article about?")
    .fill(ARTICLE_RESUME);

  await page
    .getByPlaceholder('Write your article (in markdown)')
    .fill(ARTICLE_TEXT);

  await page.getByPlaceholder(/tags/).fill('cats tdd');

  await page
    .getByRole('button', {
      name: /publish/i,
    })
    .click();

  await expect(
    page.getByRole('heading', { name: ARTICLE_TITLE }),
  ).toBeVisible();
});
