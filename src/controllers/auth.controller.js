const path = require('path');
const axios = require('axios');

function showLogin(req, res) {
    if (
        req.session &&
        req.session.authenticated
    ) {
        return res.redirect('/dashboard');
    }

    return res.sendFile(
        path.join(
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
                message:
                    'Username dan password wajib diisi'
            });
        }

        const apiBaseUrl =
            process.env.API_BASE_URL;
        console.log("API URL "+apiBaseUrl)
        if (!apiBaseUrl) {
            return res.status(500).json({
                success: false,
                message:
                    'API_BASE_URL belum dikonfigurasi'
            });
        }

        const loginUrl =
            `${apiBaseUrl.replace(/\/$/, '')}/auth/sign-in`;

        console.log(
            'Login API:',
            loginUrl
        );

        const response = await axios.post(
            loginUrl,
            {
                namaUser: username,
                kataSandi: password
            },
            {
                timeout: 30000,
                headers: {
                    'Content-Type':
                        'application/json',
                    'Accept':
                        'application/json'
                }
            }
        );

        const result = response.data;

        console.log(
            'Login API status:',
            result.status
        );

        if (
            !result ||
            !result.data ||
            !result.messages ||
            !result.messages['X-AUTH-TOKEN']
        ) {
            return res.status(401).json({
                success: false,
                message:
                    'Login API tidak mengembalikan token'
            });
        }

        const token =
            result.messages['X-AUTH-TOKEN'];

        const user =
            result.data;

        /*
         * Simpan informasi penting saja.
         *
         * Jangan simpan kataSandi/passCode
         * dari response API.
         */
        req.session.authenticated = true;

        req.session.user = {
            id: user.id,
            kdProfile: user.kdProfile,
            namaUser: user.namaUser,
            kelompokUser:
                user.kelompokUser
                    ? user.kelompokUser.kelompokUser
                    : null,
            namaLengkap:
                user.pegawai
                    ? user.pegawai.namaLengkap
                    : user.namaUser,
            profile:
                user.profile
                    ? {
                        id: user.profile.id,
                        namaLengkap:
                            user.profile.namalengkap
                    }
                    : null
        };

        /*
         * Token disimpan di server-side session.
         * Tidak dikirim kembali ke browser.
         */
        req.session.authToken = token;

        return req.session.save((error) => {
            if (error) {
                console.error(
                    'Session save error:',
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        'Gagal menyimpan session login'
                });
            }

            return res.json({
                success: true,
                message:
                    'Login berhasil',
                redirect:
                    '/dashboard',
                data: {
                    username:
                        user.namaUser,
                    namaLengkap:
                        user.pegawai
                            ? user.pegawai.namaLengkap
                            : user.namaUser
                }
            });
        });

    } catch (error) {
        console.error(
            'Login API error:',
            error.message
        );

        if (error.response) {
            console.error(
                'API response:',
                error.response.data
            );
        }

        let message =
            'Username atau password salah';

        if (
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message =
                error.response.data.message;
        }

        return res.status(
            error.response
                ? error.response.status
                : 500
        ).json({
            success: false,
            message
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
                message:
                    'Gagal logout'
            });
        }

        res.clearCookie(
            'connect.sid'
        );

        return res.json({
            success: true,
            message:
                'Logout berhasil',
            redirect:
                '/login'
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
            message:
                'Belum login'
        });
    }

    return res.json({
        success: true,
        data: req.session.user
    });
}

module.exports = {
    showLogin,
    login,
    logout,
    currentUser
};