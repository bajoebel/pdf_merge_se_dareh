var currentFilePath = '';


function initializeFileManager() {

    activateMenu('fileManager');

    setTopbarTitle('File Manager');


    var params =
        new URLSearchParams(
            window.location.search
        );


    var path =
        params.get('path') || '';


    loadFileManager(path);

}


function loadFileManager(
    relativePath
) {

    if (
        typeof relativePath !== 'string'
    ) {

        relativePath = '';

    }


    currentFilePath =
        relativePath;


    renderFileBreadcrumb(
        relativePath
    );


    $.ajax({

        url: '/api/file-manager/list',

        method: 'GET',

        dataType: 'json',

        data: {

            path: relativePath

        },

        success: function(response) {

            renderFileItems(
                response.data.items || []
            );

        }

    });

}