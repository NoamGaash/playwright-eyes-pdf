# Eyes Playwright PDF Fixture

**Warning** - This repository is for educational purposes only.

This repository demonstrates how PDF visual testing can be achieved using Playwright and Applitools Eyes. It's particularly useful for testing PDF files embedded in websites.

Please see `tests/example.spec.ts` to get the idea of how things can be.

Inside `tests/eyesPDFFixture.ts`, there are two fixtures that represent two approaches to achieve the same goal:

1. **Automatic Fixture**  
   Automatically detects and tests any PDF file requested by the browser.  
   - It's good if you want to make sure that you test all PDF files that you visit
   - It's less verbose, so the user can not notice that this test actually happen
   - Set `failTestsOnDiff` to `AfterEach` if you want visual pdf diffs to fail your playwright test.

2. **Manual Fixture**  
   Allows you to explicitly test a PDF by providing its URL.  
   - Use the `testPdf` function within your tests to manually trigger a visual test for a specific PDF.

## How It Works

### Automatic Testing
The `registerPDFListener` fixture:
- Monitors browser responses for PDFs.
- Downloads the PDFs to a temporary directory.
- Converts PDFs to images using `pdf-to-img`.
- Performs visual testing on the images using Applitools Eyes.

### Manual Testing
The `testPdf` fixture:
- Exposes a method to manually test PDFs by URL.
- Follows the same flow as the automatic testing: downloading, converting, and visually testing the PDF.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **Dependencies**:
  - `@applitools/eyes-playwright`
  - `pdf-to-img`
  - Playwright

Install the dependencies using:
```bash
npm install
```

