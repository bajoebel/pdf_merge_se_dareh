const {
    getDaftarKunjungan,getComboData
} = require('../services/visit.service');

async function getVisits(req, res) {
    try {
        const {
            tglAwal,
            tglAkhir,
            norm = '',
            noreg = '',
            nama = '',
            ruanganArr = '',
            isFasttrack = '',
            jmlRow = 100
        } = req.query;
        console.log("ruangan "+ruanganArr)
        if (!tglAwal) {
            return res.status(400).json({
                success: false,
                message: 'Parameter tglAwal wajib diisi'
            });
        }

        if (!tglAkhir) {
            return res.status(400).json({
                success: false,
                message: 'Parameter tglAkhir wajib diisi'
            });
        }

        const data = await getDaftarKunjungan(
            req,
            {
                tglAwal,
                tglAkhir,
                norm,
                noreg,
                nama,
                ruanganArr,
                isFasttrack,
                jmlRow
            }
        );

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            'Get visits error:',
            error
        );

        if (error.response) {
            console.error(
                'API status:',
                error.response.status
            );

            console.error(
                'API response:',
                error.response.data
            );

            return res.status(
                error.response.status
            ).json({
                success: false,
                message:
                    error.response.data?.message ||
                    'Gagal mengambil data kunjungan'
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Gagal mengambil data kunjungan'
        });
    }
}
async function getCombo(req, res) {
    try {
        

        const data = await getComboData(
            req,
            {}
        );

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            'Get visits error:',
            error
        );

        if (error.response) {
            console.error(
                'API status:',
                error.response.status
            );

            console.error(
                'API response:',
                error.response.data
            );

            return res.status(
                error.response.status
            ).json({
                success: false,
                message:
                    error.response.data?.message ||
                    'Gagal mengambil data kunjungan'
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Gagal mengambil data kunjungan'
        });
    }
}

module.exports = {
    getVisits, getCombo
};