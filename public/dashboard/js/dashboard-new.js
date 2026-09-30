// =========================================================
// ROUTE MAPPING
// =========================================================
const routes = {
    '/dashboard': {
        view: '/dashboard/views/home.html',
        title: 'Dashboard',
        script: '/dashboard/js/pages/dashboard.js',
        init: 'initDashboardPage'
    },
    '/dashboard/visits': {
        view: '/dashboard/views/visits.html',
        title: 'Daftar Kunjungan',
        script: '/dashboard/js/pages/visits.js',
        init: 'initVisitsPage'
    },
    '/dashboard/visits/detail': {
        view: '/dashboard/views/visit-detail.html',
        title: 'Detail Kunjungan',
        script: '/dashboard/js/pages/visit-detail.js',
        init: 'initVisitDetailPage'
    },
    '/dashboard/file-manager': {
        view: '/dashboard/views/file-manager.html',
        title: 'File Manager',
        script: '/dashboard/js/pages/file-manager.js',
        init: 'initFileManagerPage'
    }
};

// =========================================================
// MAIN ROUTER FUNCTION
// =========================================================
async function navigateTo(pathname) {
    const route = routes[pathname] || routes['/dashboard'];
    
    // 1. Update Title Topbar
    $('#topbarTitle').text(route.title);

    try {
        // 2. Fetch Partial View HTML
        const response = await fetch(route.view);
        if (!response.ok) throw new Error('Halaman view tidak ditemukan');
        const html = await response.text();

        // 3. Inject Content
        $('#pageContent').html(html);

        // 4. Update Highlight Menu Active
        updateActiveMenu(pathname);

        // 5. Load JavaScript Spesifik Halaman (jika ada)
        if (route.script) {
            $.getScript(route.script)
                .done(function () {
                    if (route.init && typeof window[route.init] === 'function') {
                        window[route.init]();
                    }
                })
                .fail(function (jqxhr, settings, exception) {
                    console.warn(`Script ${route.script} belum diisi atau gagal dimuat.`);
                });
        }
    } catch (err) {
        console.error('Routing Error:', err);
        $('#pageContent').html('<div class="alert alert-danger">Gagal memuat halaman view.</div>');
    }
}

// =========================================================
// SIDEBAR & MENU HIGHLIGHT
// =========================================================
async function loadSidebar() {
    try {
        const response = await fetch('/dashboard/views/sidebar.html');
        if (!response.ok) throw new Error('Gagal memuat sidebar');
        const html = await response.text();
        $('#sidebar').html(html);
        
        // Highlight menu sesuai URL saat ini setelah sidebar ter-render
        updateActiveMenu(window.location.pathname);
    } catch (err) {
        console.error('Error loading sidebar:', err);
    }
}

function updateActiveMenu(currentPath) {
    $('#sidebar .sidebar-menu li').removeClass('active');
    
    $('#sidebar .sidebar-menu li a').each(function () {
        const href = $(this).attr('href');
        if (currentPath === href || (href !== '/dashboard' && currentPath.startsWith(href))) {
            $(this).parent('li').addClass('active');
        }
    });
}

// =========================================================
// EVENT LISTENERS & INITIALIZATION
// =========================================================
$(document).ready(function () {
    // Intercept klik tautan SPA (mencegah full reload)
    $(document).on('click', 'a[data-link]', function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        
        if (href && href !== window.location.pathname) {
            window.history.pushState(null, '', href);
            navigateTo(href);
        }
    });

    // Handle navigasi tombol Back / Forward browser
    window.addEventListener('popstate', function () {
        navigateTo(window.location.pathname);
    });

    // Inisialisasi Pertama
    loadSidebar();
    navigateTo(window.location.pathname);
});