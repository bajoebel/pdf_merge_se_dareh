const fs = require('fs/promises');
const path = require('path');

const config = require('../config/config');

const ROOT_PATH = path.resolve(config.storage.claimPath);

function getSafePath(relativePath = '') {

    const targetPath = path.resolve(
        ROOT_PATH,
        relativePath
    );

    if (
        targetPath !== ROOT_PATH &&
        !targetPath.startsWith(ROOT_PATH + path.sep)
    ) {
        throw new Error('Akses folder tidak valid');
    }

    return targetPath;
}

function formatFileSize(bytes) {

    if (bytes === 0) {
        return '0 B';
    }

    const units = [
        'B',
        'KB',
        'MB',
        'GB'
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    return (
        bytes / Math.pow(1024, index)
    ).toFixed(2) + ' ' + units[index];
}

async function listDirectory(relativePath = '') {

    const directoryPath = getSafePath(relativePath);

    const entries = await fs.readdir(
        directoryPath,
        {
            withFileTypes: true
        }
    );

    const result = [];

    for (const entry of entries) {

        const entryRelativePath = path.join(
            relativePath,
            entry.name
        );

        const entryFullPath = getSafePath(
            entryRelativePath
        );

        const stat = await fs.stat(
            entryFullPath
        );

        if (entry.isDirectory()) {

            result.push({
                name: entry.name,
                type: 'folder',
                path: entryRelativePath.replace(/\\/g, '/'),
                size: null,
                sizeText: null,
                modifiedAt: stat.mtime
            });

        } else {

            const extension = path
                .extname(entry.name)
                .toLowerCase();

            result.push({
                name: entry.name,
                type: 'file',
                extension,
                path: entryRelativePath.replace(/\\/g, '/'),
                size: stat.size,
                sizeText: formatFileSize(stat.size),
                modifiedAt: stat.mtime
            });
        }
    }

    result.sort((a, b) => {

        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }

        return a.name.localeCompare(
            b.name,
            undefined,
            {
                numeric: true,
                sensitivity: 'base'
            }
        );
    });

    return result;
}

function getFilePath(relativePath) {

    return getSafePath(relativePath);
}

module.exports = {
    listDirectory,
    getFilePath
};