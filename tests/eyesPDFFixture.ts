import {test as base} from '@applitools/eyes-playwright/fixture';
import type { Eyes } from '@applitools/eyes-playwright';

import {tmpdir} from 'os';
import { join, resolve } from 'path';
import { writeFile, mkdir, readdir } from 'fs/promises';

export const test = base.extend
<{
    registerPDFListener: void,
    testPdf: (url: string) => Promise<void>
}>({
    // whenever a browser visits a PDF, this fixture will download the PDF and visually test it automatically
    registerPDFListener: [async ({page, eyes}, use, testInfo) => {
            const waitAfterTest: Promise<unknown>[] = [];
            page.on('response', async response => {
                const headers = response.headers();
                if (headers['content-type']?.includes('pdf')) {
                    waitAfterTest.push(downloadPdfAndVisuallyTest(testInfo.title, response.url(), eyes as Eyes));
                }
            })
            await use()
            if(waitAfterTest.length > 0) {
                console.log('Waiting for all PDFs to be processed');
                await Promise.allSettled(waitAfterTest);
            }
        },
        { auto: true, timeout: 0 }
    ],
    // this function can be used to test a PDF manually
    testPdf: async ({eyes}, use, testInfo) => {
        use((url) => downloadPdfAndVisuallyTest(testInfo.title, url, eyes as Eyes));
    }
});

async function downloadPdfAndVisuallyTest(title: string, url: string, eyes: Eyes) {
    const dirname = await downloadPdfImages(title, url);
    return await testImageFolder(dirname, eyes, title);
}

async function downloadPdfImages(title: string, url: string) {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(await download2buffer(url));

    const dirname = await createTempDir(title);
    let counter = 0;
    for await (const image of document) {
        await writeFile(join(dirname, `${++counter}.png`), image);
    }
    return dirname;
}

async function createTempDir(title: string) {
    const name = join(tmpdir(), 'pdfs', title);
    await mkdir(name, { recursive: true });
    return name;
}

async function download2buffer(url: string) {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
}

async function testImageFolder(dirname: string, eyes: Eyes, title: string) {
    console.log(`Testing PDFs in ${dirname}`);
    const files = await readdir(dirname);
    for (const file of files) {
        await eyes.check({
            name: file,
            image: resolve(dirname, file),
        });
    }
}

