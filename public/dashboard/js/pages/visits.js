var visitData = [];

// 1. Entry point yang dipanggil oleh dashboard.js
window.initVisitsPage = function () {
    initializeVisits();
};

function initializeVisits() {
    // Atur tanggal default (misal: Hari Ini) jika input tanggal masih kosong
    setDefaultDates();

    // Event listener untuk Filter / Form Submit
    bindVisitsEvents();

    // Muat data pertama kali
    loadVisits();
}

function setDefaultDates() {
    var today = new Date().toISOString().split('T')[0];
    if (!$('#tglAwal').val()) $('#tglAwal').val(today);
    if (!$('#tglAkhir').val()) $('#tglAkhir').val(today);
}

function bindVisitsEvents() {
    // Unbind event lama agar tidak terduplikasi saat berpindah halaman SPA
    $(document).off('submit', '#visitFilterForm').on('submit', '#visitFilterForm', function (e) {
        e.preventDefault(); // Mencegah reload halaman dari form submit
        loadVisits();
    });
}

function loadVisits() {
    // Sembunyikan alert error sebelumnya jika ada
    $('#visitAlert').hide().text('');

    var params = {
        tglAwal: $('#tglAwal').val() || '',
        tglAkhir: $('#tglAkhir').val() || '',
        norm: $('#norm').val() || '',
        noreg: $('#noreg').val() || '',
        nama: $('#nama').val() || '',
        limit: $('#jmlRow').val() || '100'
    };

    // Indikator Loading pada #visitTableBody
    $('#visitTableBody').html(
        '<tr><td colspan="12" class="text-center"><i class="glyphicon glyphicon-refresh spin"></i> Memuat data kunjungan...</td></tr>'
    );

    $.ajax({
        url: '/api/visits',
        method: 'GET',
        dataType: 'json',
        data: params,
        success: function (response) {
            visitData = response.data || response || [];
            
            // Update counter jumlah data
            $('#visitCount').text(visitData.length + ' data');

            // Render baris tabel
            renderVisits();
        },
        error: function (xhr, status, error) {
            console.error('Error fetching visits:', error);
            $('#visitTableBody').html(
                '<tr><td colspan="12" class="text-center text-danger">Gagal memuat data kunjungan.</td></tr>'
            );
            $('#visitAlert').text('Terjadi kesalahan saat mengambil data dari server.').show();
            $('#visitCount').text('0 data');
        }
    });
}

function renderVisits() {
    var $tbody =$('#visitTableBody');

    if (!visitData || visitData.length === 0) {
        $tbody.html('<tr><td colspan="12" class="text-center text-muted">Data kunjungan tidak ditemukan.</td></tr>');
        return;
    }

    var html = '';
    $.each(visitData, function (index, item) {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.tgl_kunjungan || item.tgl || '-'}</td>
                <td><strong>${item.norm || item.no_rm || '-'}</strong></td>
                <td>${item.nama || item.nama_pasien || '-'}</td>
                <td>${item.noreg || '-'}</td>
                <td>${item.ruangan || item.poli || item.unit || '-'}</td>
                <td>${item.dokter || '-'}</td>
                <td>${item.penjamin || item.penjamin_nama || '-'}</td>
                <td>${item.no_sep || item.nosep || '-'}</td>
                <td><span class="label label-${item.status === 'Selesai' ? 'success' : 'default'}">${item.status || 'Aktif'}</span></td>
                <td><span class="label label-info">${item.emr_status || 'Ada'}</span></td>
                <td>
                    <a href="/dashboard/visits/detail?id=${item.id || item.noreg}" data-link class="btn btn-xs btn-primary" title="Detail">
                        <i class="glyphicon glyphicon-eye-open"></i> Detail
                    </a>
                </td>
            </tr>
        `;
    });

    $tbody.html(html);
}