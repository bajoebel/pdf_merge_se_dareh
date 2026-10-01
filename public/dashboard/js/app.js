$(document).ready(function () {

    loadLayout();

    bindGlobalEvents();

    loadCurrentUser();

    renderCurrentRoute();

});


function loadLayout() {

    $('#sidebarContainer').load(
        '/dashboard/components/sidebar.html'
    );


    $('#topbarContainer').load(
        '/dashboard/components/topbar.html'
    );

}


function bindGlobalEvents() {

    $(document).on(
        'click',
        'a.menu-link',
        function(event) {

            event.preventDefault();

            var route =
                $(this).data('route');

            navigateToRoute(route);

        }
    );


    window.addEventListener(
        'popstate',
        function() {

            renderCurrentRoute();

        }
    );

}