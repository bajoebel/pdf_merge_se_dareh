const express = require('express');

const {
    getVisits, getCombo
} = require('../controllers/visit.controller');

const router = express.Router();

router.get('/', getVisits);
router.get('/combo', getCombo);

module.exports = router;