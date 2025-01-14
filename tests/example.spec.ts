import { test } from './eyesPDFFixture';

test('example test', async ({ page, eyes }) => {
  await page.goto('https://example.com');
  await eyes.check('Main Page of Example.com');
  await page.goto('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
});
