var routes = {
    dashboard: '/dashboard',

    visits: '/dashboard/visits',

    visitDetail: '/dashboard/visits/detail',

    fileManager: '/dashboard/file-manager',
};

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

    renderCurrentRoute();

    closeSidebar();
}

function renderCurrentRoute() {
    var pathname = window.location.pathname;

    if (pathname === routes.visits) {
        loadPage('visits', initializeVisits);

        return;
    }

    if (pathname === routes.visitDetail) {
        loadPage('visit-detail', renderVisitDetail);

        return;
    }

    if (pathname === routes.fileManager) {
        loadPage('file-manager', initializeFileManager);

        return;
    }

    loadPage('dashboard', initializeDashboard);
}

function loadPage(pageName, callback) {
    $('#mainContent').html(
        '<div class="page-loading">' +
            '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i>' +
            ' Memuat...' +
            '</div>'
    );

    $('#mainContent').load(
        '/dashboard/pages/' + pageName + '.html',
        function (response, status) {
            if (status !== 'success') {
                $('#mainContent').html(
                    '<div class="alert alert-danger">' +
                        'Gagal memuat halaman.' +
                        '</div>'
                );

                return;
            }

            if (typeof callback === 'function') {
                callback();
            }
        }
    );
}
