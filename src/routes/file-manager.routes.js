const express = require('express');
const {
    listFiles,
    previewFile,
    downloadFile
} = require('../controllers/file-manager.controller');
const router = express.Router();
router.get('/list', listFiles);
router.get('/preview', previewFile);
router.get('/download', downloadFile);
module.exports = router;