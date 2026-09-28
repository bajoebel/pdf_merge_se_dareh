const {
    chromium
} = require('playwright');

let browser = null;

async function getBrowser() {

    if (!browser) {

        browser =
            await chromium.launch({
                headless: true
            });

    }

    return browser;
}


async function htmlToPdf(url) {

    const browser =
        await getBrowser();

    const context =
        await browser.newContext();

    const page =
        await context.newPage();

    try {

        console.log(
            `Render HTML: ${url}`
        );

        await page.goto(
            url,
            {
                waitUntil: 'networkidle',
                timeout: 60000
            }
        );


        // Tunggu font selesai dimuat
        await page.evaluate(async () => {

            if (document.fonts) {
                await document.fonts.ready;
            }

        });


        const pdf =
            await page.pdf({

                format: 'A4',

                printBackground: true,

                preferCSSPageSize: true,

                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                }

            });


        return Buffer.from(pdf);

    } finally {

        await context.close();

    }
}


async function closeBrowser() {

    if (browser) {

        await browser.close();

        browser = null;

    }

}


module.exports = {
    htmlToPdf,
    closeBrowser
};