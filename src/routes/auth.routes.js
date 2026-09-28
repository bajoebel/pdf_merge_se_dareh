const express = require('express');

const {
    showLogin,
    login,
    logout,
    currentUser
} = require('../controllers/auth.controller');

const router = express.Router();


// Halaman login
router.get(
    '/',
    showLogin
);


// Proses login
router.post(
    '/login',
    login
);


// Logout
router.post(
    '/logout',
    logout
);


// User yang sedang login
router.get(
    '/me',
    currentUser
);


module.exports = router;