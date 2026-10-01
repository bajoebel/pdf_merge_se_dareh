const {
    mergeClaimDocuments
} = require('../services/claim.service');
const {
    getClaimPdfPath
} = require('../services/storage.service');
const fs = require('fs/promises');
async function mergeClaim(
    req,
    res
) {

    try {

        const {
            claimNumber,
            tanggal,
            type,
            documents
        } = req.body;
        // =========================
        // VALIDATION
        // =========================
        if (!claimNumber) {
            return res.status(400).json({
                success: false,
                message:
                    'claimNumber wajib diisi'

            });
        }
        if (
            !Array.isArray(documents) ||
            documents.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                   'documents wajib berisi minimal 1 dokumen'
            });
        }
        // =========================
        // PROCESS
        // =========================
        const result =
            await mergeClaimDocuments(
                claimNumber,
                tanggal,
                documents,
                type,
            );
        // =========================
        // RESPONSE
        // =========================
        return res.json({
            success: true,
            message:
                'Dokumen klaim berhasil digabungkan',
            data: result
        });
    } catch (error) {
       console.error(
           'Merge claim error:',
            error
        );
        return res.status(500).json({
            success: false,
            message:
                'Gagal menggabungkan dokumen klaim',
            error:
                error.message
        });
    }
}
async function downloadClaimPdf(req, res) {
    try {
        const {
            claimNumber
        } = req.params;
        const filePath =
            getClaimPdfPath(claimNumber);
        await fs.access(filePath);
        return res.download(
            filePath,
            `claim-${claimNumber}.pdf`
        );
    } catch (error) {
        console.error(
            'Download claim error:',
            error
        );
        return res.status(404).json({
            success: false,
            message: 'File PDF klaim tidak ditemukan'
        });
    }
}
module.exports = {
    mergeClaim, downloadClaimPdf
};