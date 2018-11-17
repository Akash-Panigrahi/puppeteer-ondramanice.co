const pet = require('puppeteer');

(async () => {

    try {

        const browser = await pet.launch({
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            headless: false,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
            ]
        });

        const page = await browser.newPage();
        await page.goto('https://ondramanice.co/drama/just-between-lovers-detail');

        await page.click('#view_more_episodes');

        await page.waitForSelector('.list_episode li a');
        const allEpLinks = await page.$$('ul.list_episode li a');

        await allEpLinks[allEpLinks.length - 1].click();

        // individual episode page is opened
        await page.waitForSelector('#download_link');
        const downloadLinksPageLink = await page.$eval('#download_link', link => link.getAttribute('href'));

        const downloadLinksPage = await browser.newPage();
        downloadLinksPage.goto(downloadLinksPageLink);

        await downloadLinksPage.waitForSelector('.dowload a');

        const downloadPageLink = await downloadLinksPage.$$eval('.dowload a', links => {
            for (link of links) {
                if (link.textContent.toLowerCase() === 'download rapidvideo') {
                    return link.href;
                }
            }
        });

        const downloadPage = await browser.newPage();
        downloadPage.goto(downloadPageLink);

        await downloadPage.waitForSelector('#button-download');
        const finalLink = await downloadPage.$$eval('#button-download', links => {
            for (link of links) {
                if (link.innerText.toLowerCase() === 'download 480p') {
                    return link.href;
                }
            }
        });

        const downloadIt = await browser.newPage();
        await downloadIt.goto(finalLink);

        // for (const link of allEpLinks.reverse()) {
        //     link.click();
        //     break;
        // }

        page.close();
    } catch (e) {
        console.log('Exception', e);
    } finally {
        console.log('Completed!');
    }

})();

async function downloadEpisode() {

}

async function getNewPageWhenLoaded() {
    return new Promise(x =>
        browser.on('targetcreated', async target => {
            if (target.type() === 'page') {

                const newPage = await target.page();

                const newPagePromise = new Promise(y =>
                    newPage.once('domcontentloaded', () => y(newPage))
                );

                const isPageLoaded = await newPage.evaluate(
                    () => document.readyState
                );

                return isPageLoaded.match('complete|interactive')
                    ? x(newPage)
                    : x(newPagePromise);
            }
        })
    );
};