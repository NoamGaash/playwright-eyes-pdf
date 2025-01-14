import { test } from '@applitools/eyes-playwright/fixture';

test('example test', async ({ page, eyes }) => {
  await page.goto('https://example.com');
  await eyes.check('Main Page of Example.com');
});
