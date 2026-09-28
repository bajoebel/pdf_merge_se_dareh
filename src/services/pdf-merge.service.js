const {
    PDFDocument
} = require('pdf-lib');

async function mergePdfBuffers(
    pdfBuffers
) {

    const mergedPdf =
        await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {

        const sourcePdf =
            await PDFDocument.load(
                pdfBuffer
            );

        const pages =
            await mergedPdf.copyPages(
                sourcePdf,
                sourcePdf.getPageIndices()
            );

        for (const page of pages) {

            mergedPdf.addPage(page);

        }
    }

    const result =
        await mergedPdf.save();

    return Buffer.from(result);
}

module.exports = {
    mergePdfBuffers
};