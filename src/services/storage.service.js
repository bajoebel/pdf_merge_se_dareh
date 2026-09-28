const fs = require('fs/promises');
const path = require('path');

const config = require('../config/config');

async function ensureDirectory(directory) {
    await fs.mkdir(directory, {
        recursive: true
    });
}

function getClaimPdfPath(claimNumber, tanggal) {

    if (!claimNumber) {
        throw new Error('claimNumber wajib diisi');
    }

    if (!tanggal) {
        throw new Error('tanggal wajib diisi');
    }

    const date = new Date(`${tanggal}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        throw new Error(
            `Format tanggal tidak valid: ${tanggal}`
        );
    }

    const year = tanggal.substring(0, 4);
    const month = tanggal.substring(5, 7);
    const day = tanggal.substring(8, 10);

    const claimDirectory = path.join(
        config.storage.claimPath,
        year,
        month,
        day
    );

    return path.join(
        claimDirectory,
        `${claimNumber}.pdf`
    );
}

async function saveClaimPdf(
    claimNumber,
    tanggal,
    pdfBuffer
) {

    const filePath = getClaimPdfPath(
        claimNumber,
        tanggal
    );

    await ensureDirectory(
        path.dirname(filePath)
    );

    await fs.writeFile(
        filePath,
        pdfBuffer
    );

    return {
        filename: path.basename(filePath),
        filePath,
        relativePath: path.relative(
            process.cwd(),
            filePath
        ),
        size: pdfBuffer.length
    };
}

module.exports = {
    saveClaimPdf,
    getClaimPdfPath
};