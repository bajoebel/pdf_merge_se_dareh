const pool = require('../config/database');

/**
 * Mengambil document resources berdasarkan jenis layanan.
 *
 * @param {string} serviceCode RAJAL / RANAP
 */
async function getDocumentResources(serviceCode) {
    const query = `
        SELECT
            dr.id,
            dr.kode,
            dr.nama,
            dr.kategori,
            dr.icon,
            dr.url_template,
            dr.target,
            dr.urutan,

            st.kode AS service_kode,
            st.nama AS service_nama

        FROM document_resources dr

        INNER JOIN document_resource_services drs
            ON drs.document_resource_id = dr.id

        INNER JOIN service_types st
            ON st.id = drs.service_type_id

        WHERE st.kode = $1
          AND dr.aktif = TRUE
          AND drs.aktif = TRUE
          AND st.aktif = TRUE

        ORDER BY
            dr.urutan ASC,
            dr.id ASC
    `;

    const result = await pool.query(query, [serviceCode]);

    return result.rows;
}

module.exports = {
    getDocumentResources
};