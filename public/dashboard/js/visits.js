(function () {

    'use strict';


    /*
     * ============================================
     * ELEMENTS
     * ============================================
     */

    var $form = $('#visitFilterForm');
    var $tableBody = $('#visitTableBody');
    var $visitCount = $('#visitCount');
    var $alert = $('#visitAlert');
    var $button = $('#btnSearchVisit');


    /*
     * ============================================
     * INIT
     * ============================================
     */

    $(document).ready(function () {

        setDefaultDate();

        $form.on(
            'submit',
            function (event) {
                event.preventDefault();

                loadVisits();
            }
        );

        loadVisits();

    });


    /*
     * ============================================
     * DEFAULT DATE
     * ============================================
     */

    function setDefaultDate() {

        var today =
            formatDateInput(
                new Date()
            );

        $('#tglAwal').val(today);
        $('#tglAkhir').val(today);

    }


    /*
     * ============================================
     * FORMAT DATE
     * ============================================
     */

    function formatDateInput(date) {

        var year =
            date.getFullYear();

        var month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0');

        var day =
            String(
                date.getDate()
            ).padStart(2, '0');

        return (
            year +
            '-' +
            month +
            '-' +
            day
        );

    }


    /*
     * ============================================
     * API DATE
     * ============================================
     */

    function getStartDate(
        date
    ) {

        return (
            date +
            ' 00:00:00'
        );

    }


    function getEndDate(
        date
    ) {

        return (
            date +
            ' 23:59:00'
        );

    }


    /*
     * ============================================
     * LOAD VISITS
     * ============================================
     */

    function loadVisits() {

        hideAlert();

        var tglAwal =
            $('#tglAwal').val();

        var tglAkhir =
            $('#tglAkhir').val();

        var norm =
            $.trim(
                $('#norm').val()
            );

        var noreg =
            $.trim(
                $('#noreg').val()
            );

        var nama =
            $.trim(
                $('#nama').val()
            );

        var jmlRow =
            $('#jmlRow').val();


        if (!tglAwal || !tglAkhir) {

            showAlert(
                'Tanggal awal dan tanggal akhir wajib diisi.',
                'warning'
            );

            return;
        }


        if (tglAwal > tglAkhir) {

            showAlert(
                'Tanggal awal tidak boleh lebih besar dari tanggal akhir.',
                'warning'
            );

            return;
        }


        setLoading(true);


        $.ajax({

            url: '/api/visits',

            method: 'GET',

            dataType: 'json',

            data: {

                tglAwal:
                    getStartDate(tglAwal),

                tglAkhir:
                    getEndDate(tglAkhir),

                norm: norm,

                noreg: noreg,

                nama: nama,

                ruanganArr: '',

                isFasttrack: '',

                jmlRow: jmlRow

            },

            success: function (response) {

                if (
                    !response ||
                    response.success !== true
                ) {

                    showAlert(
                        response &&
                        response.message
                            ? response.message
                            : 'Gagal mengambil data kunjungan.',
                        'danger'
                    );

                    renderEmpty();

                    return;
                }


                var visits =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];


                renderVisits(visits);

            },

            error: function (xhr) {

                var message =
                    'Gagal mengambil data kunjungan.';


                if (
                    xhr.responseJSON &&
                    xhr.responseJSON.message
                ) {

                    message =
                        xhr.responseJSON.message;

                }


                if (
                    xhr.status === 401
                ) {

                    message =
                        'Session login sudah berakhir. Silakan login kembali.';

                }


                showAlert(
                    message,
                    'danger'
                );

                renderEmpty();

            },

            complete: function () {

                setLoading(false);

            }

        });

    }


    /*
     * ============================================
     * RENDER VISITS
     * ============================================
     */

    function renderVisits(
        visits
    ) {

        $tableBody.empty();


        $visitCount.text(
            visits.length +
            ' data'
        );


        if (
            !visits.length
        ) {

            renderEmpty();

            return;

        }


        $.each(
            visits,
            function (
                index,
                visit
            ) {

                var row =
                    createVisitRow(
                        visit,
                        index
                    );

                $tableBody.append(
                    row
                );

            }
        );

    }


    /*
     * ============================================
     * CREATE ROW
     * ============================================
     */

    function createVisitRow(
        visit,
        index
    ) {

        var tanggal =
            formatDateTime(
                visit.tglregistrasi
            );


        var patientName =
            escapeHtml(
                visit.namapasien ||
                '-'
            );


        var norm =
            escapeHtml(
                visit.nocm ||
                '-'
            );


        var noreg =
            escapeHtml(
                visit.noregistrasi ||
                '-'
            );


        var ruangan =
            escapeHtml(
                visit.namaruangan ||
                '-'
            );


        var dokter =
            escapeHtml(
                visit.namadokter ||
                '-'
            );


        var kelompokPasien =
            escapeHtml(
                visit.kelompokpasien ||
                '-'
            );


        var nosep =
            escapeHtml(
                visit.nosep ||
                '-'
            );


        var status =
            getStatusBadge(
                visit
            );


        var emr =
            visit.total_emr_isi != null
                ? visit.total_emr_isi
                : 0;


        var detailUrl =
            createDetailUrl(
                visit
            );


        return (

            '<tr>' +

                '<td>' +
                    (index + 1) +
                '</td>' +

                '<td>' +
                    '<div>' +
                        tanggal +
                    '</div>' +
                '</td>' +

                '<td>' +

                    '<div class="registration-number">' +
                        norm +
                    '</div>' +

                '</td>' +

                '<td>' +

                    '<div class="patient-name">' +
                        patientName +
                    '</div>' +

                    '<div class="patient-rm">' +
                        escapeHtml(
                            visit.jeniskelamin ||
                            ''
                        ) +
                    '</div>' +

                '</td>' +

                '<td>' +

                    '<div class="registration-number">' +
                        noreg +
                    '</div>' +

                '</td>' +

                '<td>' +
                    ruangan +
                '</td>' +

                '<td>' +
                    dokter +
                '</td>' +

                '<td>' +
                    kelompokPasien +
                '</td>' +

                '<td>' +

                    '<span class="sep-number">' +
                        nosep +
                    '</span>' +

                '</td>' +

                '<td>' +
                    status +
                '</td>' +

                '<td>' +

                    '<span class="visit-badge badge-info">' +
                        escapeHtml(
                            String(emr)
                        ) +
                    '</span>' +

                '</td>' +

                '<td>' +

                    '<a ' +
                        'href="' +
                            detailUrl +
                        '" ' +
                        'class="btn btn-visit-detail"' +
                    '>' +

                        '<i class="glyphicon glyphicon-eye-open"></i> ' +
                        'Detail' +

                    '</a>' +

                '</td>' +

            '</tr>'

        );

    }


    /*
     * ============================================
     * DETAIL URL
     * ============================================
     */

    function createDetailUrl(
        visit
    ) {

        var params =
            new URLSearchParams();


        /*
         * Untuk sementara kita kirim
         * noregistrasi sebagai identifier.
         *
         * Nanti dapat ditambahkan:
         * nosep
         * norec_pd
         * norec_apd
         */

        params.set(
            'noregistrasi',
            visit.noregistrasi || ''
        );


        if (visit.nocm) {

            params.set(
                'nocm',
                visit.nocm
            );

        }


        if (visit.nosep) {

            params.set(
                'nosep',
                visit.nosep
            );

        }


        return (
            '/dashboard/visits/detail?' +
            params.toString()
        );

    }


    /*
     * ============================================
     * STATUS BADGE
     * ============================================
     */

    function getStatusBadge(
        visit
    ) {

        if (
            visit.tglselesaiperiksa
        ) {

            return (
                '<span class="visit-badge badge-success">' +
                    '<i class="glyphicon glyphicon-ok"></i> ' +
                    'Selesai' +
                '</span>'
            );

        }


        if (
            visit.ischeckin === true
        ) {

            return (
                '<span class="visit-badge badge-info">' +
                    '<i class="glyphicon glyphicon-log-in"></i> ' +
                    'Check-in' +
                '</span>'
            );

        }


        return (
            '<span class="visit-badge badge-muted">' +
                'Menunggu' +
            '</span>'
        );

    }


    /*
     * ============================================
     * FORMAT DATETIME
     * ============================================
     */

    function formatDateTime(
        value
    ) {

        if (!value) {
            return '-';
        }


        var parts =
            String(value).split(' ');


        if (parts.length < 2) {

            return escapeHtml(
                value
            );

        }


        var date =
            parts[0];

        var time =
            parts[1];


        var dateParts =
            date.split('-');


        if (
            dateParts.length !== 3
        ) {

            return escapeHtml(
                value
            );

        }


        return (
            dateParts[2] +
            '/' +
            dateParts[1] +
            '/' +
            dateParts[0] +
            '<br>' +
            '<small>' +
                escapeHtml(time) +
            '</small>'
        );

    }


    /*
     * ============================================
     * EMPTY
     * ============================================
     */

    function renderEmpty() {

        $tableBody.html(

            '<tr>' +

                '<td ' +
                    'colspan="12"' +
                '>' +

                    '<div class="visit-empty">' +

                        '<div class="visit-empty-icon">' +

                            '<i class="glyphicon glyphicon-inbox"></i>' +

                        '</div>' +

                        '<div class="visit-empty-title">' +
                            'Tidak ada data kunjungan' +
                        '</div>' +

                        '<div class="visit-empty-description">' +
                            'Tidak ditemukan kunjungan sesuai filter yang dipilih.' +
                        '</div>' +

                    '</div>' +

                '</td>' +

            '</tr>'

        );

    }


    /*
     * ============================================
     * LOADING
     * ============================================
     */

    function setLoading(
        loading
    ) {

        if (loading) {

            $button
                .prop(
                    'disabled',
                    true
                )
                .html(
                    '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i> Memuat...'
                );


            $tableBody.html(

                '<tr>' +

                    '<td colspan="12">' +

                        '<div class="visit-loading">' +

                            '<div>' +
                                '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i>' +
                            '</div>' +

                            '<div class="visit-loading-text">' +
                                'Mengambil data kunjungan...' +
                            '</div>' +

                        '</div>' +

                    '</td>' +

                '</tr>'

            );

            return;

        }


        $button
            .prop(
                'disabled',
                false
            )
            .html(
                '<i class="glyphicon glyphicon-search"></i> Cari'
            );

    }


    /*
     * ============================================
     * ALERT
     * ============================================
     */

    function showAlert(
        message,
        type
    ) {

        $alert
            .removeClass(
                'alert alert-danger alert-warning alert-info alert-success'
            )
            .addClass(
                'alert alert-' +
                type
            )
            .html(
                escapeHtml(message)
            )
            .show();

    }


    function hideAlert() {

        $alert.hide();

    }


    /*
     * ============================================
     * ESCAPE HTML
     * ============================================
     */

    function escapeHtml(
        value
    ) {

        return $('<div>')
            .text(
                value == null
                    ? ''
                    : String(value)
            )
            .html();

    }

})();