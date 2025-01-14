import {test as base, EyesConfig} from '@applitools/eyes-playwright/fixture';
import { Eyes, Target } from '@applitools/eyes-playwright';

import {tmpdir} from 'os';
import { basename, join, resolve } from 'path';
import { writeFile, mkdir, rm, readdir } from 'fs/promises';

export const test = base.extend
<{ registerPDFListener: void }>({
    registerPDFListener: [async ({page, eyesConfig}, use, testInfo) => {
            const promises: Promise<void>[] = [];
            page.on('response', async response => {
                const headers = response.headers();
                if (headers['content-type'].includes('pdf')) {
                    promises.push(Promise.resolve().then(async buffer => {
                        const dirname = await downloadToTmp(testInfo.title, response.url());
                        await testImageFolder(dirname, eyesConfig, testInfo.title);
                    }));
                }
            })
            await use()
            if(promises.length > 0) {
                console.log('Waiting for all PDFs to be processed');
                await Promise.all(promises);
            }
        },
        { auto: true }
    ]
});

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


async function testImageFolder(dirname: string, eyesConfig: EyesConfig, title: string) {
    console.log(`Testing PDFs in ${dirname}`);
    const eyes = new Eyes(eyesConfig as any);
    // eyes.setConfiguration(eyesConfig as any);
    await eyes.open(title, title);
    const files = await readdir(dirname);
    for (const file of files) {
        const target = Target.image(resolve(join(dirname, file)))
        await eyes.check(file, target);
    }
    const result = await eyes.close(eyesConfig.failTestsOnDiff === 'afterEach');
    if (result.isNew) {
        console.log(`New test ${title} - ${result.url}`);
    } else if(result.status !== 'Passed') {
        console.log(`Test ${title} - ${result.url}`);
    }
}

