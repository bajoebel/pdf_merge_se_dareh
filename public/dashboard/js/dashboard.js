(function () {
    'use strict';

    /* =====================================================
               GLOBAL STATE
    ====================================================== */

    var currentRoute = null;

    var currentFilePath = '';

    /* =====================================================
               ROUTES
            ====================================================== */

    var routes = {
        dashboard: '/dashboard',
        visits: '/dashboard/visits',
        visitDetail: '/dashboard/visits/detail',
        fileManager: '/dashboard/file-manager',
    };

    /* =====================================================
               INIT
            ====================================================== */

    $(document).ready(function () {
        /*
         * Mobile sidebar
         */

        $('#mobileMenuButton').on('click', function () {
            $('#sidebar').addClass('open');

            $('#sidebarOverlay').addClass('open');
        });

        $('#sidebarOverlay').on('click', closeSidebar);

        /*
         * Navigation
         */

        $(document).on('click', 'a.menu-link', function (event) {
            event.preventDefault();
            var route = $(this).data('route');
            navigateToRoute(route);
        });

        /*
         * Back detail
         */

        $('#btnBackVisits').on('click', function () {
            navigateToRoute('visits');
        });

        /*
         * Logout
         */

        $('#btnLogout').on('click', logout);

        /*
         * Browser back / forward
         */

        window.addEventListener('popstate', function () {
            renderCurrentUrl();
        });

        /*
         * Visit filter
         */

        $('#visitFilterForm').on('submit', function (event) {
            event.preventDefault();

            loadVisits();
        });

        /*
         * File refresh
         */

        $('#btnRefreshFiles').on('click', function () {
            loadFileManager(currentFilePath);
        });

        /*
         * File breadcrumb
         */

        $(document).on('click', '.file-breadcrumb-link', function (event) {
            event.preventDefault();

            var path = $(this).data('file-path') || '';

            loadFileManager(path);
        });

        /*
         * File folder
         */

        $(document).on(
            'click',
            '#fileManagerBody tr[data-type="folder"]',
            function () {
                var folderPath = $(this).data('path');

                if (folderPath) {
                    loadFileManager(folderPath);
                }
            }
        );

        /*
         * File preview
         */

        $(document).on('click', '.file-preview-action', function (event) {
            event.preventDefault();

            var filePath = $(this).data('path');

            previewFile(filePath);
        });

        /*
         * File download
         */

        $(document).on('click', '.file-download-action', function (event) {
            event.preventDefault();

            var filePath = $(this).data('path');

            downloadFile(filePath);
        });

        /*
         * Initial page
         */

        loadCurrentUser();

        renderCurrentUrl();
    });

    /* =====================================================
               NAVIGATION
            ====================================================== */

    function navigateToRoute(route, params) {
        var url = routes[route];

        if (!url) {
            url = routes.dashboard;
        }

        if (params) {
            var query = new URLSearchParams(params).toString();

            if (query) {
                url += '?' + query;
            }
        }

        window.history.pushState({}, '', url);
        renderCurrentUrl();
        closeSidebar();
    }

    /* =====================================================
               RENDER CURRENT URL
            ====================================================== */

    function renderCurrentUrl() {
        var pathname = window.location.pathname;
        var params = new URLSearchParams(window.location.search);
        hideAllViews();
        if (pathname === routes.visits) {
            currentRoute = 'visits';
            activateMenu('visits');
            setTopbarTitle('Data Kunjungan');
            $('#viewVisits').addClass('active');
            initializeVisits();
            return;
        }
        if (pathname === routes.visitDetail) {
            currentRoute = 'visit-detail';
            activateMenu('visits');
            setTopbarTitle('Detail Kunjungan');
            $('#viewVisitDetail').addClass('active');
            renderVisitDetail(params);
            return;
        }
        if (pathname === routes.fileManager) {
            currentRoute = 'file-manager';
            activateMenu('file-manager');
            setTopbarTitle('File Manager');
            $('#viewFileManager').addClass('active');
            var filePath = params.get('path') || '';
            loadFileManager(filePath);
            return;
        }

        /*
         * Default
         */

        currentRoute = 'dashboard';

        activateMenu('dashboard');

        setTopbarTitle('Dashboard');

        $('#viewDashboard').addClass('active');

        loadDashboardStats();
    }

    /* =====================================================
               HIDE VIEWS
            ====================================================== */

    function hideAllViews() {
        $('.dashboard-view').removeClass('active');
    }

    /* =====================================================
               ACTIVE MENU
            ====================================================== */

    function activateMenu(route) {
        $('.sidebar-menu a.menu-link').removeClass('active');

        $('.sidebar-menu a[data-route="' + route + '"]').addClass('active');

        /*
         * Quick access links
         */

        $('.quick-menu.menu-link').removeClass('active');
    }

    /* =====================================================
               TOPBAR TITLE
            ====================================================== */

    function setTopbarTitle(title) {
        $('#topbarTitle').text(title);
    }

    /* =====================================================
               CURRENT USER
            ====================================================== */

    function loadCurrentUser() {
        $.ajax({
            url: '/login/me',

            method: 'GET',

            dataType: 'json',

            success: function (response) {
                if (!response || !response.success) {
                    return;
                }

                var user = response.data || response.user || {};

                var name =
                    user.namaLengkap ||
                    user.namaUser ||
                    user.username ||
                    'User';

                var role = user.kelompokUser || 'User';

                $('#userName').text(name);

                $('#userRole').text(role);
            },

            error: function () {
                $('#userName').text('User');
            },
        });
    }

    /* =====================================================
               LOGOUT
            ====================================================== */

    function logout() {
        if (!window.confirm('Apakah Anda yakin ingin logout?')) {
            return;
        }

        $.ajax({
            url: '/login/logout',

            method: 'POST',

            dataType: 'json',

            success: function () {
                window.location.href = '/login';
            },

            error: function () {
                window.location.href = '/login';
            },
        });
    }

    /* =====================================================
               DASHBOARD STATS
            ====================================================== */

    function loadDashboardStats() {
        /*
         * Untuk sementara statistik
         * kunjungan menggunakan API yang sama.
         */

        var today = formatDateInput(new Date());

        $.ajax({
            url: '/api/visits',

            method: 'GET',

            dataType: 'json',

            data: {
                tglAwal: today + ' 00:00:00',

                tglAkhir: today + ' 23:59:00',

                norm: '',

                noreg: '',

                nama: '',

                ruanganArr: '',

                isFasttrack: '',

                jmlRow: 100,
            },

            success: function (response) {
                if (response && response.success) {
                    var visits = Array.isArray(response.data)
                        ? response.data
                        : [];

                    $('#statVisits').text(visits.length);
                }
            },

            error: function () {
                $('#statVisits').text('-');
            },
        });

        /*
         * File statistics
         */

        $.ajax({
            url: '/api/file-manager/list',

            method: 'GET',

            dataType: 'json',

            data: {
                path: '',
            },

            success: function (response) {
                if (response && response.success && response.data) {
                    var items = response.data.items || [];

                    var folders = items.filter(function (item) {
                        return item.type === 'folder';
                    });

                    var files = items.filter(function (item) {
                        return item.type === 'file';
                    });

                    $('#statFolders').text(folders.length);

                    $('#statDocuments').text(files.length);
                }
            },
        });
    }

    /* =====================================================
               VISITS INITIALIZE
            ====================================================== */

    var visitsInitialized = false;

    function initializeVisits() {
        if (!visitsInitialized) {
            setDefaultVisitDate();
            visitsInitialized = true;
        }
        loadVisits();
        loadRuang();
    }

    /* =====================================================
               DEFAULT VISIT DATE
            ====================================================== */

    function setDefaultVisitDate() {
        var today = formatDateInput(new Date());

        $('#tglAwal').val(today);

        $('#tglAkhir').val(today);
    }

    /* =====================================================
               LOAD VISITS
            ====================================================== */

    function loadVisits() {
        var tglAwal = $('#tglAwal').val();
        var tglAkhir = $('#tglAkhir').val();
        var norm = $.trim($('#norm').val() || '');
        var noreg = $.trim($('#noreg').val() || '');
        var nama = $.trim($('#nama').val() || '');
        var ruang = $.trim($('#ruanganArr').val() || '');
        // alert(ruang)
        var jmlRow = $('#jmlRow').val() || 100;
        if (!tglAwal || !tglAkhir) {
            showVisitAlert('Tanggal awal dan tanggal akhir wajib diisi.');
            return;
        }
        if (tglAwal > tglAkhir) {
            showVisitAlert(
                'Tanggal awal tidak boleh lebih besar dari tanggal akhir.'
            );
            return;
        }
        hideVisitAlert();
        setVisitLoading(true);
        $.ajax({
            url: '/api/visits',
            method: 'GET',
            dataType: 'json',
            data: {
                tglAwal: tglAwal + ' 00:00:00',
                tglAkhir: tglAkhir + ' 23:59:00',
                norm: norm,
                noreg: noreg,
                nama: nama,
                ruanganArr: ruang,
                isFasttrack: '',
                jmlRow: jmlRow,
            },

            success: function (response) {
                if (!response || response.success !== true) {
                    showVisitAlert(
                        response && response.message
                            ? response.message
                            : 'Gagal mengambil data kunjungan.'
                    );
                    renderVisitEmpty();
                    return;
                }
                var visits = Array.isArray(response.data) ? response.data : [];
                renderVisits(visits);
            },
            error: function (xhr) {
                var message = 'Gagal mengambil data kunjungan.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }
                if (xhr.status === 401) {
                    message =
                        'Session login sudah berakhir. Silakan login kembali.';
                }
                showVisitAlert(message);
                renderVisitEmpty();
            },
            complete: function () {
                setVisitLoading(false);
            },
        });
    }

    function loadRuang() {
        
        $.ajax({
            url: '/api/visits/combo',
            method: 'GET',
            dataType: 'json',
            data: {},

            success: function (response) {
                if (!response || response.success !== true) {
                    showVisitAlert(
                        response && response.message
                            ? response.message
                            : 'Gagal mengambil data kunjungan.'
                    );
                    // renderVisitEmpty();
                    return;
                }
                var visits = response.data.ruanganRi;
                let option=`<option value="">Pilih Ruangan</option>`;
                // console.log("visits")
                // // alert("ruangan")
                // console.log(response.data.ruanganRi)
                // let ruang = response.data
                console.log("list Ruangan")
                visits.forEach(e => {
                    console.log(e.id)
                    option+=`<option value='${e.id}'>${e.reportdisplay}</option>`
                });
                $('#ruanganArr').html(option)
            },
            error: function (xhr) {
                var message = 'Gagal mengambil data kunjungan.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }
                if (xhr.status === 401) {
                    message =
                        'Session login sudah berakhir. Silakan login kembali.';
                }
                showVisitAlert(message);
                renderVisitEmpty();
            },
            complete: function () {
                setVisitLoading(false);
            },
        });
    }

    /* =====================================================
               RENDER VISITS
            ====================================================== */

    function renderVisits(visits) {
        var $body = $('#visitTableBody');

        $body.empty();

        $('#visitCount').text(visits.length + ' data');

        if (!visits.length) {
            renderVisitEmpty();

            return;
        }

        $.each(visits, function (index, visit) {
            $body.append(createVisitRow(visit, index));
        });
    }

    /* =====================================================
               CREATE VISIT ROW
            ====================================================== */

    function createVisitRow(visit, index) {
        var tanggal = formatDateTime(visit.tglregistrasi);

        var norm = escapeHtml(visit.nocm || '-');

        var nama = escapeHtml(visit.namapasien || '-');

        var gender = escapeHtml(visit.jeniskelamin || '');

        var noreg = escapeHtml(visit.noregistrasi || '-');

        var ruangan = escapeHtml(visit.namaruangan || '-');

        var dokter = escapeHtml(visit.namadokter || '-');

        var penjamin = escapeHtml(visit.kelompokpasien || '-');

        var nosep = escapeHtml(visit.nosep || '-');

        var emr = visit.total_emr_isi != null ? visit.total_emr_isi : 0;

        var status = getVisitStatus(visit);

        var detailUrl = createVisitDetailUrl(visit);

        return (
            '<tr>' +
            '<td>' +
            (index + 1) +
            '</td>' +
            '<td>' +
            tanggal +
            '</td>' +
            '<td>' +
            '<span class="registration-number">' +
            norm +
            '</span>' +
            '</td>' +
            '<td>' +
            '<div class="patient-name">' +
            nama +
            '</div>' +
            '<div class="patient-gender">' +
            gender +
            '</div>' +
            '</td>' +
            '<td>' +
            '<span class="registration-number">' +
            noreg +
            '</span>' +
            '</td>' +
            '<td>' +
            ruangan +
            '</td>' +
            '<td>' +
            dokter +
            '</td>' +
            '<td>' +
            penjamin +
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
            '<span class="visit-badge badge-info-custom">' +
            escapeHtml(String(emr)) +
            '</span>' +
            '</td>' +
            '<td>' +
            '<a ' +
            'href="' +
            detailUrl +
            '" ' +
            'class="btn btn-visit-detail"' +
            'data-noreg="' +
            escapeHtml(visit.noregistrasi || '') +
            '"' +
            '>' +
            '<i class="glyphicon glyphicon-eye-open"></i> ' +
            'Detail' +
            '</a>' +
            '</td>' +
            '</tr>'
        );
    }

    /* =====================================================
               DETAIL URL
            ====================================================== */

    function createVisitDetailUrl(visit) {
        console.log('Visit Url');
        console.log(visit);
        var params = new URLSearchParams();
        if (visit.noregistrasi) {
            params.set('noregistrasi', visit.noregistrasi);
        }
        if (visit.nocm) {
            params.set('nocm', visit.nocm);
        }
        if (visit.nosep) {
            params.set('nosep', visit.nosep);
        }
        if (visit.norec_pd) {
            params.set('norec_pd', visit.norec_pd);
        }
        if (visit.norec_apd) {
            params.set('norec_apd', visit.norec_apd);
        }
        if (visit.namapasien) {
            params.set('namapasien', visit.namapasien);
        }
        if (visit.tgllahir) {
            params.set('tgllahir', visit.tgllahir);
        }
        if (visit.jeniskelamin) {
            params.set('jeniskelamin', visit.jeniskelamin);
        }
        if (visit.namaruangan) {
            params.set('namaruangan', visit.namaruangan);
        }
        if (visit.tglregistrasi) {
            params.set('tglregistrasi', visit.tglregistrasi);
        }
        if (visit.tgllahir) {
            params.set('tgllahir', visit.tgllahir);
        }
        if (visit.kelompokpasien) {
            params.set('kelompokpasien', visit.kelompokpasien);
        }
        return routes.visitDetail + '?' + params.toString();
    }
    /* =====================================================
               VISIT STATUS
            ====================================================== */
    function getVisitStatus(visit) {
        if (visit.tglselesaiperiksa) {
            return (
                '<span class="visit-badge badge-success-custom">' +
                '<i class="glyphicon glyphicon-ok"></i> ' +
                'Selesai' +
                '</span>'
            );
        }

        if (visit.ischeckin === true) {
            return (
                '<span class="visit-badge badge-info-custom">' +
                '<i class="glyphicon glyphicon-log-in"></i> ' +
                'Check-in' +
                '</span>'
            );
        }

        return (
            '<span class="visit-badge badge-muted-custom">' +
            'Menunggu' +
            '</span>'
        );
    }

    /* =====================================================
               VISIT DETAIL
            ====================================================== */

    function renderVisitDetail(params) {
        var noreg = params.get('noregistrasi') || '-';
        var norm = params.get('nocm') || '-';
        var nosep = params.get('nosep') || '-';
        var namapasien = params.get('namapasien') || '-';
        var tgllahir = params.get('tgllahir') || '-';
        var jeniskelamin = params.get('jeniskelamin') || '-';
        var namaruangan = params.get('namaruangan') || '-';
        var tglregistrasi = params.get('tglregistrasi') || '-';
        var kelompokpasien = params.get('kelompokpasien') || '-';

        $('#detailNoreg').text(noreg);
        $('#detailNorm').text(norm);
        $('#detailNosep').text(nosep);
        $('#detailNama').text(namapasien);
        $('#detailGender').text(jeniskelamin);
        $('#detailTanggal').text(tglregistrasi);
        $('#detailBirth').text(tgllahir);
        $('#detailDokter').text(namapasien);
        $('#detailRuangan').text(namaruangan);
        $('#detailPenjamin').text(kelompokpasien);

        /*
         * Saat ini halaman detail
         * mendapatkan identifier dari URL.
         *
         * Data lengkap akan kita sambungkan
         * ke API detail kunjungan pada tahap berikutnya.
         */
    }

    /* =====================================================
               FILE MANAGER
            ====================================================== */

    function loadFileManager(relativePath) {
        /*
         * Pastikan relativePath selalu string.
         */
        if (relativePath === undefined || relativePath === null) {
            relativePath = '';
        } else {
            relativePath = String(relativePath);
        }

        currentFilePath = relativePath;

        renderFileBreadcrumb(relativePath);

        setFileLoading(true);

        $.ajax({
            url: '/api/file-manager/list',

            method: 'GET',

            dataType: 'json',

            data: {
                path: relativePath,
            },

            success: function (response) {
                if (!response || !response.success) {
                    showFileAlert(
                        response && response.message
                            ? response.message
                            : 'Gagal mengambil data file.'
                    );

                    renderFileEmpty();

                    return;
                }

                var data = response.data || {};

                renderFileItems(data.items || []);
            },

            error: function (xhr) {
                var message = 'Gagal mengambil data file.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }

                if (xhr.status === 401) {
                    message = 'Session login sudah berakhir.';
                }

                showFileAlert(message);

                renderFileEmpty();
            },

            complete: function () {
                setFileLoading(false);
            },
        });
    }

    /* =====================================================
               FILE BREADCRUMB
            ====================================================== */

    function renderFileBreadcrumb(relativePath) {
        var $breadcrumb = $('#fileBreadcrumb');

        $breadcrumb.empty();

        var rootLi = $('<li></li>');

        rootLi.append(
            $('<a></a>')
                .attr('href', '#')
                .attr('data-file-path', '')
                .addClass('file-breadcrumb-link')
                .html('<i class="glyphicon glyphicon-home"></i> Claims')
        );

        $breadcrumb.append(rootLi);

        if (!relativePath) {
            return;
        }

        var parts = relativePath.split('/').filter(function (item) {
            return item !== '';
        });

        var accumulated = '';

        $.each(parts, function (index, part) {
            accumulated += (accumulated ? '/' : '') + part;

            var li = $('<li></li>');

            if (index === parts.length - 1) {
                li.addClass('active');

                li.text(part);
            } else {
                li.append(
                    $('<a></a>')
                        .attr('href', '#')
                        .attr('data-file-path', accumulated)
                        .addClass('file-breadcrumb-link')
                        .text(part)
                );
            }

            $breadcrumb.append(li);
        });
    }

    /* =====================================================
               FILE ITEMS
            ====================================================== */

    function renderFileItems(items) {
        var $body = $('#fileManagerBody');

        $body.empty();

        if (!items.length) {
            renderFileEmpty();

            return;
        }

        $.each(items, function (index, item) {
            $body.append(createFileRow(item));
        });
    }

    /* =====================================================
               CREATE FILE ROW
            ====================================================== */

    function createFileRow(item) {
        var safeName = escapeHtml(item.name || '-');

        var safePath = escapeHtml(item.path || '');

        var modified = item.modifiedAt ? formatFileDate(item.modifiedAt) : '-';

        if (item.type === 'folder') {
            return (
                '<tr ' +
                'data-type="folder" ' +
                'data-path="' +
                safePath +
                '"' +
                'class="file-manager-folder-row"' +
                '>' +
                '<td>' +
                '<span class="folder-icon">' +
                '<i class="glyphicon glyphicon-folder-open"></i>' +
                '</span>' +
                '<span class="file-manager-name">' +
                safeName +
                '</span>' +
                '</td>' +
                '<td>' +
                '-' +
                '</td>' +
                '<td>' +
                modified +
                '</td>' +
                '<td>' +
                '<span style="color:#9aa5af;font-size:10px;">' +
                'Buka folder' +
                '</span>' +
                '</td>' +
                '</tr>'
            );
        }

        return (
            '<tr>' +
            '<td>' +
            '<span class="file-icon">' +
            '<i class="' +
            getFileIcon(item.extension) +
            '"></i>' +
            '</span>' +
            '<span class="file-manager-name">' +
            safeName +
            '</span>' +
            '</td>' +
            '<td>' +
            escapeHtml(item.sizeText || '-') +
            '</td>' +
            '<td>' +
            modified +
            '</td>' +
            '<td>' +
            '<button ' +
            'type="button" ' +
            'class="file-action file-preview-action" ' +
            'data-path="' +
            safePath +
            '"' +
            'title="Preview"' +
            '>' +
            '<i class="glyphicon glyphicon-eye-open"></i>' +
            '</button>' +
            '<button ' +
            'type="button" ' +
            'class="file-action file-download-action" ' +
            'data-path="' +
            safePath +
            '"' +
            'title="Download"' +
            '>' +
            '<i class="glyphicon glyphicon-download-alt"></i>' +
            '</button>' +
            '</td>' +
            '</tr>'
        );
    }

    /* =====================================================
               FILE ICON
            ====================================================== */

    function getFileIcon(extension) {
        extension = String(extension || '').toLowerCase();

        if (extension === '.pdf') {
            return 'glyphicon glyphicon-file';
        }

        if (
            extension === '.jpg' ||
            extension === '.jpeg' ||
            extension === '.png' ||
            extension === '.gif'
        ) {
            return 'glyphicon glyphicon-picture';
        }

        return 'glyphicon glyphicon-file';
    }

    /* =====================================================
               FILE PREVIEW
            ====================================================== */

    function previewFile(filePath) {
        if (!filePath) {
            return;
        }

        var url =
            '/api/file-manager/preview?path=' + encodeURIComponent(filePath);

        window.open(url, '_blank');
    }

    /* =====================================================
               FILE DOWNLOAD
            ====================================================== */

    function downloadFile(filePath) {
        if (!filePath) {
            return;
        }

        var url =
            '/api/file-manager/download?path=' + encodeURIComponent(filePath);

        window.location.href = url;
    }

    /* =====================================================
               FILE LOADING
            ====================================================== */

    function setFileLoading(loading) {
        if (loading) {
            $('#fileManagerBody').html(
                '<tr>' +
                    '<td colspan="4">' +
                    '<div class="loading-state">' +
                    '<div>' +
                    '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i>' +
                    '</div>' +
                    '<div>' +
                    'Memuat file...' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '</tr>'
            );
        }
    }

    /* =====================================================
               FILE EMPTY
            ====================================================== */

    function renderFileEmpty() {
        $('#fileManagerBody').html(
            '<tr>' +
                '<td colspan="4">' +
                '<div class="empty-state">' +
                '<div class="empty-icon">' +
                '<i class="glyphicon glyphicon-folder-open"></i>' +
                '</div>' +
                '<div class="empty-title">' +
                'Folder kosong' +
                '</div>' +
                '<div class="empty-description">' +
                'Tidak terdapat file atau folder pada lokasi ini.' +
                '</div>' +
                '</div>' +
                '</td>' +
                '</tr>'
        );
    }

    /* =====================================================
               FILE ALERT
            ====================================================== */

    function showFileAlert(message) {
        $('#fileManagerAlert').text(message).show();
    }

    function hideFileAlert() {
        $('#fileManagerAlert').hide();
    }

    /* =====================================================
               VISIT ALERT
            ====================================================== */

    function showVisitAlert(message) {
        $('#visitAlert').text(message).show();
    }

    function hideVisitAlert() {
        $('#visitAlert').hide();
    }

    /* =====================================================
               VISIT LOADING
            ====================================================== */

    function setVisitLoading(loading) {
        var $button = $('#btnSearchVisit');

        if (loading) {
            $button
                .prop('disabled', true)
                .html(
                    '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i> ' +
                        'Memuat...'
                );

            $('#visitTableBody').html(
                '<tr>' +
                    '<td colspan="12">' +
                    '<div class="loading-state">' +
                    '<div>' +
                    '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i>' +
                    '</div>' +
                    '<div>' +
                    'Mengambil data kunjungan...' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '</tr>'
            );

            return;
        }

        $button
            .prop('disabled', false)
            .html('<i class="glyphicon glyphicon-search"></i> ' + 'Cari');
    }

    /* =====================================================
               VISIT EMPTY
            ====================================================== */

    function renderVisitEmpty() {
        $('#visitTableBody').html(
            '<tr>' +
                '<td colspan="12">' +
                '<div class="empty-state">' +
                '<div class="empty-icon">' +
                '<i class="glyphicon glyphicon-inbox"></i>' +
                '</div>' +
                '<div class="empty-title">' +
                'Tidak ada data kunjungan' +
                '</div>' +
                '<div class="empty-description">' +
                'Tidak ditemukan kunjungan sesuai filter.' +
                '</div>' +
                '</div>' +
                '</td>' +
                '</tr>'
        );

        $('#visitCount').text('0 data');
    }

    /* =====================================================
               DATE FORMAT
            ====================================================== */

    function formatDateInput(date) {
        var year = date.getFullYear();

        var month = String(date.getMonth() + 1).padStart(2, '0');

        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    /* =====================================================
               DATETIME FORMAT
            ====================================================== */

    function formatDateTime(value) {
        if (!value) {
            return '-';
        }

        var parts = String(value).split(' ');

        if (parts.length < 2) {
            return escapeHtml(value);
        }

        var date = parts[0];

        var time = parts[1];

        var dateParts = date.split('-');

        if (dateParts.length !== 3) {
            return escapeHtml(value);
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

    /* =====================================================
               FILE DATE FORMAT
            ====================================================== */

    function formatFileDate(value) {
        if (!value) {
            return '-';
        }

        var date = new Date(value);

        if (isNaN(date.getTime())) {
            return '-';
        }

        var day = String(date.getDate()).padStart(2, '0');

        var month = String(date.getMonth() + 1).padStart(2, '0');

        var year = date.getFullYear();

        var hour = String(date.getHours()).padStart(2, '0');

        var minute = String(date.getMinutes()).padStart(2, '0');

        return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
    }

    /* =====================================================
               URL PATH
            ====================================================== */

    function getUrlPath() {
        var params = new URLSearchParams(window.location.search);

        return params.get('path') || '';
    }

    /* =====================================================
               ESCAPE HTML
            ====================================================== */

    function escapeHtml(value) {
        return $('<div>')
            .text(value == null ? '' : String(value))
            .html();
    }

    /* =====================================================
               SIDEBAR
            ====================================================== */

    function closeSidebar() {
        $('#sidebar').removeClass('open');

        $('#sidebarOverlay').removeClass('open');
    }
})();
