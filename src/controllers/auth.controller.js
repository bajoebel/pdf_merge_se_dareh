function showLogin(req, res) {
    if (req.session && req.session.authenticated) {
        return res.redirect('/file-manager');
    }

    return res.sendFile(
        require('path').join(
            process.cwd(),
            'public',
            'login',
            'index.html'
        )
    );
}


async function login(req, res) {
    try {
        const {
            username,
            password
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi'
            });
        }

        const adminUsername =
            process.env.ADMIN_USERNAME;

        const adminPassword =
            process.env.ADMIN_PASSWORD;

        if (
            username !== adminUsername ||
            password !== adminPassword
        ) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        req.session.authenticated = true;
        req.session.username = username;

        return res.json({
            success: true,
            message: 'Login berhasil',
            redirect: '/file-manager'
        });

    } catch (error) {
        console.error(
            'Login error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat login'
        });
    }
}


function logout(req, res) {
    req.session.destroy((error) => {

        if (error) {
            console.error(
                'Logout error:',
                error
            );

            return res.status(500).json({
                success: false,
                message: 'Gagal logout'
            });
        }

        res.clearCookie('connect.sid');

        return res.json({
            success: true,
            message: 'Logout berhasil',
            redirect: '/login'
        });
    });
}


function currentUser(req, res) {
    if (
        !req.session ||
        !req.session.authenticated
    ) {
        return res.status(401).json({
            success: false,
            message: 'Belum login'
        });
    }

    return res.json({
        success: true,
        data: {
            username: req.session.username
        }
    });
}


module.exports = {
    showLogin,
    login,
    logout,
    currentUser
};