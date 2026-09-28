const { PDFDocument } = require('pdf-lib');

const {
    getPdfFromDocument
} = require('./document.service');

const {
    mergePdfBuffers
} = require('./pdf-merge.service');

const {
    saveClaimPdf
} = require('./storage.service');


async function mergeClaimDocuments(
    claimNumber,
    tanggal,
    documents
) {

    const sortedDocuments = [...documents].sort(
        (a, b) => a.sequence - b.sequence
    );

    const pdfBuffers = [];
    const documentResults = [];

    for (const document of sortedDocuments) {

        console.log(
            `Processing: ${document.sequence} - ${document.name}`
        );

        const pdfBuffer =
            await getPdfFromDocument(document);

        // Validasi bahwa hasil resource benar-benar PDF
        const pdf =
            await PDFDocument.load(pdfBuffer);

        const pageCount =
            pdf.getPageCount();

        pdfBuffers.push(pdfBuffer);

        documentResults.push({
            sequence: document.sequence,
            name: document.name,
            type: document.type,
            pageCount,
            size: pdfBuffer.length
        });
    }


    console.log('Merging PDF...');

    const finalPdf =
        await mergePdfBuffers(pdfBuffers);


    console.log('Saving PDF...');

    // PENTING:
    // parameter harus claimNumber, tanggal, finalPdf
    const storage =
        await saveClaimPdf(
            claimNumber,
            tanggal,
            finalPdf
        );


    const mergedDocument =
        await PDFDocument.load(finalPdf);

    const pageCount =
        mergedDocument.getPageCount();


    return {

        claimNumber,

        tanggal,

        filename:
            storage.filename,

        path:
            storage.relativePath,

        size:
            storage.size,

        pageCount,

        downloadUrl:
            `/api/claims/${encodeURIComponent(claimNumber)}/download?tanggal=${encodeURIComponent(tanggal)}`,

        documents:
            documentResults

    };
}


module.exports = {
    mergeClaimDocuments
};