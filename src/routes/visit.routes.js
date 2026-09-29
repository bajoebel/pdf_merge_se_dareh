const express = require('express');

const {
    getVisits
} = require('../controllers/visit.controller');

const router = express.Router();

router.get('/', getVisits);

module.exports = router;