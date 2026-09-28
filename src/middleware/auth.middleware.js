function requireAuth(req, res, next) {

    if (
        req.session &&
        req.session.authenticated
    ) {
        return next();
    }

    // Request API
    if (
        req.path.startsWith('/api/')
    ) {
        return res.status(401).json({
            success: false,
            message: 'Session login sudah berakhir'
        });
    }

    return res.redirect('/login');
}


module.exports = {
    requireAuth
};