const axios = require('axios');

const {
    htmlToPdf
} = require('./html-to-pdf.service');


async function getPdfFromDocument(
    document
) {

    if (!document.url) {

        throw new Error(
            `URL tidak tersedia: ${document.name}`
        );

    }


    if (!document.type) {

        throw new Error(
            `Type tidak tersedia: ${document.name}`
        );

    }


    switch (document.type) {

        case 'html':

            return await htmlToPdf(
                document.url
            );


        case 'pdf':

            return await downloadPdf(
                document.url
            );


        default:

            throw new Error(
                `Type tidak didukung: ${document.type}`
            );

    }

}


async function downloadPdf(url) {

    const response =
        await axios.get(
            url,
            {
                responseType: 'arraybuffer',
                timeout: 60000
            }
        );


    const contentType =
        response.headers['content-type'] || '';


    if (
        !contentType.includes('pdf') &&
        !url.toLowerCase().endsWith('.pdf')
    ) {

        throw new Error(
            `Resource bukan PDF: ${url}`
        );

    }


    return Buffer.from(
        response.data
    );

}


module.exports = {
    getPdfFromDocument
};