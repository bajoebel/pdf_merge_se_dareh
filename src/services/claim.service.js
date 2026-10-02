const { PDFDocument } = require('pdf-lib');
const { getPdfFromDocument } = require('./document.service');
const { mergePdfBuffers } = require('./pdf-merge.service');
const { saveClaimPdf } = require('./storage.service');
// async function mergeClaimDocuments(
//     claimNumber,
//     tanggal,
//     documents
// ) {
//     const sortedDocuments = [...documents].sort(
//         (a, b) => a.sequence - b.sequence
//     );
//     const pdfBuffers = [];
//     const documentResults = [];
//     for (const document of sortedDocuments) {
//         console.log(
//             `Processing: ${document.sequence} - ${document.name}`
//         );
//         const pdfBuffer =
//             await getPdfFromDocument(document);
//         // Validasi bahwa hasil resource benar-benar PDF
//         const pdf =
//             await PDFDocument.load(pdfBuffer);
//         const pageCount =
//             pdf.getPageCount();
//         pdfBuffers.push(pdfBuffer);
//         documentResults.push({
//             sequence: document.sequence,
//             name: document.name,
//             type: document.type,
//             pageCount,
//             size: pdfBuffer.length
//         });
//     }
//     console.log('Merging PDF...');
//     const finalPdf =
//         await mergePdfBuffers(pdfBuffers);
//     console.log('Saving PDF...');
//     // PENTING:
//     // parameter harus claimNumber, tanggal, finalPdf
//     const storage =
//         await saveClaimPdf(
//             claimNumber,
//             tanggal,
//             finalPdf
//         );
//     const mergedDocument =
//         await PDFDocument.load(finalPdf);
//     const pageCount =
//         mergedDocument.getPageCount();
//     return {
//         claimNumber,
//         tanggal,
//         filename: storage.filename,
//         path: storage.relativePath,
//         size: storage.size,
//         pageCount,
//         downloadUrl: `/api/claims/${encodeURIComponent(claimNumber)}/download?tanggal=${encodeURIComponent(tanggal)}`,
//         documents: documentResults
//     };
// }

async function mergeClaimDocuments(claimNumber, tanggal, documents, type = 'file') {
    const sortedDocuments = [...documents].sort(
        (a, b) => a.sequence - b.sequence
    );
    const pdfBuffers = [];
    const documentResults = [];

    // 1. Loop dan proses setiap dokumen PDF
    for (const document of sortedDocuments) {
        console.log(`Processing: ${document.sequence} - ${document.name}`);
        const pdfBuffer = await getPdfFromDocument(document);

        const pdf = await PDFDocument.load(pdfBuffer);
        const pageCount = pdf.getPageCount();

        pdfBuffers.push(pdfBuffer);
        documentResults.push({
            sequence: document.sequence,
            name: document.name,
            type: document.type,
            pageCount,
            size: pdfBuffer.length
        });
    }

    // 2. Merge PDF
    console.log('Merging PDF...');
    const finalPdf = await mergePdfBuffers(pdfBuffers);

    // 3. Hitung total halaman hasil merge
    const mergedDocument = await PDFDocument.load(finalPdf);
    const pageCount = mergedDocument.getPageCount();

    // 4. Cabangkan logika berdasarkan type
    // if (type === 'blob') {
    //         const blob = new Blob([finalPdf], { type: 'application/pdf' });
    //         const blobUrl = URL.createObjectURL(blob);

    //         return {
    //             claimNumber,
    //             tanggal,
    //             pageCount,
    //             size: blob.size,
    //             blob,
    //             blobUrl,
    //             documents: documentResults
    //         };
    //     } else {
    //         console.log('Saving PDF to storage...');
    //         const storage = await saveClaimPdf(claimNumber, tanggal, finalPdf);

    //         // storage.relativePath diasumsikan bernilai contoh: "2026/07/09/0319R0010726V001812.pdf"
    //         const encodedPath = encodeURIComponent(storage.relativePath);
    //         console.log(tanggal)
    //         const pathnew = tanggal.replaceAll('-','/');
    //         console.log("path "+pathnew)
    //         return {
    //             claimNumber,
    //             tanggal,
    //             pageCount,
    //             size: storage.size,
    //             filename: storage.filename,
    //             path: storage.relativePath,
    //             downloadUrl: `/api/file-manager/preview?path=${pathnew}/${claimNumber}.pdf`,
    //             documents: documentResults
    //         };
    //     }
    // 4. Cabangkan logika berdasarkan type
    if (type === 'blob') {
        // Mengubah Buffer PDF menjadi Base64 String agar aman dikirim via JSON
        const base64Pdf = Buffer.from(finalPdf).toString('base64');

        return {
            claimNumber,
            tanggal,
            pageCount,
            size: finalPdf.length,
            // Kirimkan data Base64 dengan Data URI Scheme
            blobUrl: `data:application/pdf;base64,${base64Pdf}`,
            documents: documentResults
        };
    } else {
        // Logika penyimpanan file tetap sama
        console.log('Saving PDF to storage...');
        const storage = await saveClaimPdf(claimNumber, tanggal, finalPdf);

        const pathnew = tanggal.replaceAll('-', '/');
        return {
            claimNumber,
            tanggal,
            pageCount,
            size: storage.size,
            filename: storage.filename,
            path: storage.relativePath,
            downloadUrl: `/api/file-manager/preview?path=${pathnew}/${claimNumber}.pdf`,
            documents: documentResults
        };
    }
}
module.exports = {
    mergeClaimDocuments
};