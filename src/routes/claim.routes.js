const express = require('express');
const { mergeClaim } = require('../controllers/claim.controller');
const { downloadClaimPdf } = require('../controllers/claim.controller');
const router = express.Router();
router.post('/merge', mergeClaim);
router.get('/:claimNumber/download', downloadClaimPdf);
module.exports = router;