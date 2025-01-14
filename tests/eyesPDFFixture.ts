import {test as base, EyesConfig} from '@applitools/eyes-playwright/fixture';
import { ConfigurationPlain, Eyes, Target, TestResults } from '@applitools/eyes-playwright';

import {tmpdir} from 'os';
import { basename, join, resolve } from 'path';
import { writeFile, mkdir, rm, readdir } from 'fs/promises';

export const test = base.extend
<{
    registerPDFListener: void,
    testPdf: (url: string) => Promise<TestResults>
}>({
    // whenever a browser visits a PDF, this fixture will download the PDF and visually test it automatically
    registerPDFListener: [async ({page, eyesConfig}, use, testInfo) => {
            const waitAfterTest: Promise<unknown>[] = [];
            page.on('response', async response => {
                const headers = response.headers();
                if (headers['content-type']?.includes('pdf')) {
                    waitAfterTest.push(downloadPdfAndVisuallyTest(testInfo.title, response.url(), eyesConfig));
                }
            })
            await use()
            if(waitAfterTest.length > 0) {
                console.log('Waiting for all PDFs to be processed');
                await Promise.all(waitAfterTest);
            }
        },
        { auto: true, timeout: 0 }
    ],
    // this function can be used to test a PDF manually
    testPdf: async ({eyesConfig}, use, testInfo) => {
        use((url) => downloadPdfAndVisuallyTest(testInfo.title, url, eyesConfig));
    }
});

async function downloadPdfAndVisuallyTest(title: string, url: string, eyesConfig: ConfigurationPlain | EyesConfig) {
    const dirname = await downloadToTmp(title, url);
    return await testImageFolder(dirname, eyesConfig, title);
}

async function downloadToTmp(title: string, url: string) {
    const dirname = tmpdir() + '/pdfs/' + title;
    await mkdir(dirname, { recursive: true });
    const filename = join(dirname, basename(url));
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await writeFile(filename, Buffer.from(buffer));
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(filename);

    const imagesDir = join(dirname, 'images');
    await mkdir(imagesDir, { recursive: true });
    let counter = 0;
    for await (const image of document) {
        await writeFile(join(imagesDir, `${++counter}.png`), image);
    }
    await rm(filename);
    return imagesDir;
}


async function testImageFolder(dirname: string, eyesConfig: ConfigurationPlain | EyesConfig, title: string) {
    console.log(`Testing PDFs in ${dirname}`);
    const eyes = new Eyes(eyesConfig as ConfigurationPlain);
    // eyes.setConfiguration(eyesConfig as any);
    await eyes.open(title, title);
    const files = await readdir(dirname);
    for (const file of files) {
        const target = Target.image(resolve(join(dirname, file)))
        await eyes.check(file, target);
    }
    const result = await eyes.close(!!(eyesConfig as EyesConfig).failTestsOnDiff);
    console.log(`PDF test results: ${result.url}`);
    return result;
}

