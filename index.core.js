const pet = require('puppeteer-core')
    , wsEndpoint = require('./wsEndpoint')
    ;

(async () => {

    try {
        const browserWSEndpoint = await wsEndpoint();

        const browser = await pet.connect({
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            browserWSEndpoint,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
            ]
        });

        const page = await browser.newPage();
        await page.goto('https://ondramanice.co/drama/just-between-lovers-detail');

        await page.click('#view_more_episodes');

        await page.waitForSelector('.list_episode li a');
        const allEpLinks = await page.$$('ul.list_episode li a');

        await allEpLinks[allEpLinks.length - 1].click();

        // individual episode page is opened
        const downloadLink = await page.waitForSelector('#download_link');

        await page.click('#download_link');
        const navigationPromise = page.waitForNavigation();
        // await navigationPromise;

        // await downloadLink.click();
        // await page.waitForNavigation();

        // await Promise.all([
        //     page.waitForNavigation(),
        //     page.click('#download_link')
        // ]);

        const browserPages = await browser.pages();
        let downloadPage;

        for (const page of browserPages) {
            await page.title()
                .then(title => {
                    if (title.startsWith('Just Between Lovers')) {
                        downloadPage = page;
                    }
                });

            if (downloadPage) break;
        }

        if (!downloadPage) return;

        console.log('hye');
        await downloadPage.waitForSelector('.dowload a');
        const videoDownloadLinks = await downloadPage.$$('.dowload a');

        for (const vLink of videoDownloadLinks) {
            // await vLink.click();
            console.log(vLink);
            break;
        }

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