import { EyesFixture } from '@applitools/eyes-playwright/fixture';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig<EyesFixture>({
  testDir: './tests',
  reporter: '@applitools/eyes-playwright/reporter',
  use: {
    eyesConfig: {
      failTestsOnDiff: 'afterEach',
      // You can configure API key and Server URL here, but I personally prefer to use environment variables -
      // APPLITOOLS_API_KEY and APPLITOOLS_SERVER_URL
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      // seems like we must use headless false to test PDF files
      use: { ...devices['Desktop Chrome'], headless: false },
    },
  ],

});
