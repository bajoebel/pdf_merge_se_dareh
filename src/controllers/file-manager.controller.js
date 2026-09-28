const fs = require('fs/promises');
const path = require('path');

const {
    listDirectory,
    getFilePath
} = require('../services/file-manager.service');

async function listFiles(req, res) {
    try {
        const relativePath = req.query.path || '';
        const items = await listDirectory(
            relativePath
        );
        return res.json({
            success: true,
            data: {
                path: relativePath,
                items
            }
        });
    } catch (error) {
        console.error(
            'File manager error:',
            error
        );
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
async function previewFile(req, res) {
    try {
        const relativePath = req.query.path;
        if (!relativePath) {
            return res.status(400).json({
                success: false,
                message: 'Path file wajib diisi'
            });
        }
        const filePath = getFilePath(
            relativePath
        );
        await fs.access(filePath);
        const extension = path
            .extname(filePath)
            .toLowerCase();
        const allowedExtensions = [
            '.pdf',
            '.png',
            '.jpg',
            '.jpeg',
            '.gif'
        ];
        if (!allowedExtensions.includes(extension)) {
            return res.status(400).json({
                success: false,
                message: 'File tidak dapat dipreview'
            });
        }
        return res.sendFile(
            filePath
        );
    } catch (error) {
        console.error(
            'Preview file error:',
            error
        );
        return res.status(404).json({
            success: false,
            message: 'File tidak ditemukan'
        });
    }
}
async function downloadFile(req, res) {
    try {
        const relativePath = req.query.path;
        if (!relativePath) {
            return res.status(400).json({
                success: false,
                message: 'Path file wajib diisi'
            });
        }
        const filePath = getFilePath(
            relativePath
        );
        await fs.access(filePath);
        return res.download(
            filePath,
            path.basename(filePath)
        );
    } catch (error) {
        console.error(
            'Download file error:',
            error
        );
        return res.status(404).json({
            success: false,
            message: 'File tidak ditemukan'
        });
    }
}
module.exports = {
    listFiles,
    previewFile,
    downloadFile
};