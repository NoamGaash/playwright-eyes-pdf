import { test } from './eyesPDFFixture';

test('example test', async ({ page, eyes }) => {
  await page.goto('https://example.com');
  await eyes.check('Main Page of Example.com');
  await page.goto('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  // the dummy PDF is automatically tested by the fixture
});

test('pdf embedded in iframe', async ({ page, eyes }) => {
  await page.goto('https://www.w3docs.com/tools/code-editor/1085');
  // the PDF embedded in the iframe is automatically tested by the fixture
})

test('test PDF from link', async ({ page, testPdf }) => {
  await page.goto('https://applitools.com/automated-visual-testing-best-practices-guide/');
  const link = await page.$('a[href$=".pdf"]');
  const url = await link?.getAttribute('href');
  if(!url) throw new Error('No PDF link found');
  test.setTimeout(0); // disable timeout for this test - the PDF has many pages
  await testPdf(url);
})
