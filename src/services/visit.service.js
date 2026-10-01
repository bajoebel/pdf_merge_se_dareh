const { apiGet } = require('./api.service');

async function getDaftarKunjungan(
    req,
    filters = {}
) {
    const {
        tglAwal,
        tglAkhir,
        norm = '',
        noreg = '',
        nama = '',
        ruanganArr = '',
        isFasttrack = '',
        jmlRow = 100
    } = filters;

    const params = {
        tglAwal,
        tglAkhir,
        norm,
        noreg,
        nama,
        ruanganArr,
        isFasttrack,
        jmlRow
    };

    return await apiGet(
        req,
        'rawatjalan/get-daftar-antrian-rajal',
        params
    );
}
async function getComboData(
    req,
    filters = {}
) {
    
    const params = {};

    return await apiGet(
        req,
        'rawatjalan/get-data-combo-operator',
        params
    );
}

module.exports = {
    getDaftarKunjungan,getComboData
};