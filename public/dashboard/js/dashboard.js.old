(function ($) {
  "use strict";

  var currentClaim = null;

  var pageMeta = {
    dashboard: { title: "Dashboard", parent: "Dashboard" },
    visits: { title: "Data Kunjungan", parent: "Kunjungan" },
    "visit-detail": { title: "Detail Kunjungan", parent: "Data Kunjungan" },
    "file-manager": { title: "File Manager", parent: "File Manager" },
  };

  function normalizePath(path) {
    path = String(path || "").replace(/\\/g, "/");
    path = path.replace(/^\/+|\/+$/g, "");
    return path;
  }

  function showToast(message, type) {
    var $toast = $("#appToast");
    $toast.removeClass("error");
    if (type === "error") $toast.addClass("error");
    $("#toastMessage").text(message);
    $toast.stop(true, true).fadeIn(180).delay(2500).fadeOut(300);
  }

  function updateHeader(page) {
    var meta = pageMeta[page] || pageMeta.dashboard;
    $("#breadcrumbParent").text(meta.parent);
    $("#pageTitle").text(meta.title);
    $(".sidebar-nav li").removeClass("active");
    var navPage = page === "visit-detail" ? "visits" : page;
    $(".sidebar-nav a[data-page='" + navPage + "']")
      .closest("li")
      .addClass("active");
  }

  function routeFor(page, params) {
    if (page === "dashboard") return "/dashboard";
    if (page === "visits") return "/dashboard/visits";
    if (page === "file-manager") return "/dashboard/file-manager";
    if (page === "visit-detail") {
      return (
        "/dashboard/visits/detail?claimNumber=" +
        encodeURIComponent(params.claimNumber || "")
      );
    }
    return "/dashboard";
  }

  function navigate(page, params, replace) {
    var url = routeFor(page, params || {});
    if (replace)
      history.replaceState({ page: page, params: params || {} }, "", url);
    else history.pushState({ page: page, params: params || {} }, "", url);
    renderRoute();
  }

  function renderRoute() {
    var path = window.location.pathname;
    var search = new URLSearchParams(window.location.search);
    var page = "dashboard";
    var params = {};

    if (path === "/dashboard" || path === "/dashboard/") {
      page = "dashboard";
    } else if (path === "/dashboard/visits" || path === "/dashboard/visits/") {
      page = "visits";
    } else if (path.indexOf("/dashboard/visits/detail") === 0) {
      page = "visit-detail";
      params.claimNumber = search.get("claimNumber") || "";
    } else if (
      path === "/dashboard/file-manager" ||
      path === "/dashboard/file-manager/"
    ) {
      page = "file-manager";
    }

    var template = $("#tpl-" + page).html();
    if (!template)
      template =
        "<div class='alert alert-danger'>Halaman tidak ditemukan.</div>";
    $("#pageContent").html(template);
    updateHeader(page);

    if (page === "visits") initVisits();
    if (page === "visit-detail") initVisitDetail(params);
    if (page === "file-manager") initFileManager();

    window.scrollTo(0, 0);
  }

  function initVisits() {
    $(".btn-detail")
      .off("click")
      .on("click", function () {
        navigate("visit-detail", {
          claimNumber: $(this).attr("data-claim") || "",
        });
      });

    $("#btnSearchVisit").off("click").on("click", filterVisits);
    $("#visitSearch")
      .off("keyup")
      .on("keyup", function (e) {
        if (e.keyCode === 13) filterVisits();
      });
  }

  function filterVisits() {
    var keyword = $.trim($("#visitSearch").val()).toLowerCase();
    $("#visitTableBody tr").each(function () {
      var text = $(this).text().toLowerCase();
      $(this).toggle(!keyword || text.indexOf(keyword) !== -1);
    });
  }

  function initVisitDetail(params) {
    var claim = params.claimNumber || "";
    if (claim) {
      $("#detailSEP").text(claim);
      $("#modalClaimNumber").text(claim);
    }

    $("#btnGenerateTop, #btnGenerateDocument")
      .off("click")
      .on("click", function () {
        $("#modalGenerate").modal("show");
      });

    $(".btn-preview-doc")
      .off("click")
      .on("click", function () {
        showToast("Preview dokumen akan dihubungkan ke sumber dokumen.");
      });

    $("#btnGenerateDocument").data("claim-number", claim);
  }

  function renderFileManager(path) {
    path = normalizePath(path);
    var $body = $("#fileManagerBody");
    $body.html(
      '<tr><td colspan="5" class="file-loading"><i class="fa fa-spinner fa-spin"></i> Memuat...</td></tr>',
    );

    $.getJSON("/api/file-manager/list", { path: path })
      .done(function (response) {
        if (!response.success) {
          throw new Error(response.message || "Gagal mengambil daftar file");
        }
        renderFileRows(response.data.items || []);
        renderFileBreadcrumb(path);
        $("#fileManagerCurrentPath").text(path || "claims");
      })
      .fail(function (xhr) {
        var message = "Gagal mengambil data File Manager";
        if (xhr.responseJSON && xhr.responseJSON.message)
          message = xhr.responseJSON.message;
        $body.html(
          '<tr><td colspan="5"><div class="alert alert-danger file-error">' +
            escapeHtml(message) +
            "</div></td></tr>",
        );
      });
  }

  function renderFileRows(items) {
    var $body = $("#fileManagerBody").empty();
    if (!items.length) {
      $body.html(
        '<tr><td colspan="5" class="file-empty"><i class="fa fa-folder-open-o"></i><br>Folder kosong</td></tr>',
      );
      return;
    }

    $.each(items, function (_, item) {
      var modified = item.modifiedAt ? formatDate(item.modifiedAt) : "-";
      var isFolder = item.type === "folder";
      var icon = isFolder ? "fa-folder" : getFileIcon(item.extension);
      var typeText = isFolder
        ? "Folder"
        : (item.extension || "File").replace(".", "").toUpperCase();
      var action = isFolder
        ? '<button class="btn btn-default btn-xs btn-open-folder" data-path="' +
          escapeAttr(item.path) +
          '"><i class="fa fa-folder-open"></i> Buka</button>'
        : '<button class="btn btn-default btn-xs btn-preview-file" data-path="' +
          escapeAttr(item.path) +
          '"><i class="fa fa-eye"></i></button> ' +
          '<button class="btn btn-default btn-xs btn-download-file" data-path="' +
          escapeAttr(item.path) +
          '"><i class="fa fa-download"></i></button>';

      var $tr = $("<tr></tr>");
      $tr.append(
        '<td><i class="fa ' +
          icon +
          " file-icon " +
          (isFolder ? "folder-icon" : "") +
          '"></i><strong>' +
          escapeHtml(item.name) +
          "</strong></td>",
      );
      $tr.append("<td>" + escapeHtml(typeText) + "</td>");
      $tr.append("<td>" + escapeHtml(item.sizeText || "-") + "</td>");
      $tr.append("<td>" + escapeHtml(modified) + "</td>");
      $tr.append("<td>" + action + "</td>");
      $body.append($tr);
    });

    bindFileActions();
  }

  function bindFileActions() {
    $(".btn-open-folder")
      .off("click")
      .on("click", function () {
        renderFileManager($(this).attr("data-path"));
      });

    $(".btn-preview-file")
      .off("click")
      .on("click", function () {
        var path = $(this).attr("data-path");
        var url = "/api/file-manager/preview?path=" + encodeURIComponent(path);
        $("#filePreviewFrame").attr("src", url);
        $("#filePreviewName").text(path.split("/").pop());
        $("#modalFilePreview").modal("show");
      });

    $(".btn-download-file")
      .off("click")
      .on("click", function () {
        var path = $(this).attr("data-path");
        window.location.href =
          "/api/file-manager/download?path=" + encodeURIComponent(path);
      });
  }

  function renderFileBreadcrumb(path) {
    var $crumb = $("#fileBreadcrumb").empty();
    var parts = path ? path.split("/").filter(Boolean) : [];
    var accumulated = "";

    $crumb.append(
      '<a href="#" class="file-crumb" data-path=""><i class="fa fa-home"></i> claims</a>',
    );

    $.each(parts, function (_, part) {
      accumulated += (accumulated ? "/" : "") + part;
      $crumb.append("<span>/</span>");
      $crumb.append(
        '<a href="#" class="file-crumb" data-path="' +
          escapeAttr(accumulated) +
          '">' +
          escapeHtml(part) +
          "</a>",
      );
    });

    $(".file-crumb")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        renderFileManager($(this).attr("data-path"));
      });
  }

  function initFileManager() {
    renderFileManager("");
    $("#btnRefreshFiles")
      .off("click")
      .on("click", function () {
        renderFileManager(
          $("#fileManagerCurrentPath").text() === "claims"
            ? ""
            : $("#fileManagerCurrentPath").text(),
        );
      });
  }

  function formatDate(value) {
    var d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    var pad = function (n) {
      return n < 10 ? "0" + n : n;
    };
    return (
      pad(d.getDate()) +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      d.getFullYear() +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function getFileIcon(ext) {
    ext = String(ext || "").toLowerCase();
    if (ext === ".pdf") return "fa-file-pdf-o";
    if ([".jpg", ".jpeg", ".png", ".gif"].indexOf(ext) !== -1)
      return "fa-file-image-o";
    return "fa-file-o";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function logout() {
    $.post("/login/logout")
      .done(function (response) {
        window.location.href = response.redirect || "/login";
      })
      .fail(function () {
        window.location.href = "/login";
      });
  }

  $(document).on("click", "[data-page]", function (e) {
    e.preventDefault();
    navigate($(this).attr("data-page"));
  });
  $(document).on(
    "click",
    '#fileManagerBody tr[data-type="folder"]',
    function () {
      var folderPath = $(this).data("path");

      if (folderPath) {
        loadFileManager(folderPath);
      }
    },
  );
  $(document).on("click", "[data-page-link]", function (e) {
    e.preventDefault();
    navigate($(this).attr("data-page-link"));
  });

  $(window).on("popstate", function () {
    renderRoute();
  });

  $("#btnSidebar").on("click", function () {
    $("#sidebar").toggleClass("open");
  });
  $(document).on("click", ".sidebar-nav a", function () {
    if ($(window).width() <= 991) $("#sidebar").removeClass("open");
  });
  $("#btnLogout, #btnLogoutTop").on("click", function (e) {
    e.preventDefault();
    logout();
  });

  $("#btnConfirmGenerate").on("click", function () {
    var $button = $(this);
    var claimNumber = $("#detailSEP").text().trim();
    var tanggal = $("#detailDate").data("date") || "2026-09-28";

    $button
      .prop("disabled", true)
      .html('<i class="fa fa-spinner fa-spin"></i> Memproses...');

    // Endpoint siap dipasang ketika data dokumen sudah berasal dari database/API.
    $.ajax({
      url: "/api/claims/merge",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        claimNumber: claimNumber,
        tanggal: tanggal,
        documents: [],
      }),
    })
      .done(function () {
        showToast("Dokumen berhasil digenerate.");
        $("#modalGenerate").modal("hide");
      })
      .fail(function (xhr) {
        var message = "Gagal generate dokumen.";
        if (xhr.responseJSON && xhr.responseJSON.message)
          message = xhr.responseJSON.message;
        showToast(message, "error");
      })
      .always(function () {
        $button
          .prop("disabled", false)
          .html('<i class="fa fa-cogs"></i> Mulai Generate');
      });
  });

  $.get("/login/me").done(function (response) {
    if (response && response.success && response.data) {
      var username = response.data.username || "Admin";
      $("#sidebarUsername, #topUsername").text(username);
    }
  });

  $(function () {
    renderRoute();
  });
})(jQuery);
