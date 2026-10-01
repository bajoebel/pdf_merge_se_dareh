const express = require('express');

const router = express.Router();

const documentResourceController =
    require('../controllers/document-resource.controller');

const {
    requireAuth
} = require('../middleware/auth.middleware');

router.get(
    '/',
    requireAuth,
    documentResourceController.getDocumentResources
);

module.exports = router;