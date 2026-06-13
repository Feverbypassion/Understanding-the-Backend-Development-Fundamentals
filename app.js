(function () {
  "use strict";

  var SITE_TITLE = "Understanding the Backend Development Fundamentals";
  var DOCS_PATH = "docs/";
  var GITHUB_REPO = "Feverbypassion/Understanding-the-Backend-Development-Fundamentals";
  var documentList = document.getElementById("documentList");
  var reader = document.getElementById("reader");
  var documents = [];
  var markdownCache = new Map();

  function setReaderState(message, type) {
    reader.className = "markdown-body";
    reader.innerHTML = "";

    var state = document.createElement("div");
    state.className = "reader-state" + (type ? " reader-state--" + type : "");
    state.textContent = message;
    reader.appendChild(state);
  }

  function getEncodedPath(file) {
    return file
      .split("/")
      .map(function (part) {
        return encodeURIComponent(part);
      })
      .join("/");
  }

  function titleFromFilename(file) {
    var name = file.split("/").pop() || file;
    return name
      .replace(/\.md$/i, "")
      .replace(/^\d+[_-]?/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
  }

  function isMarkdownPath(file) {
    return /^docs\/.+\.md$/i.test(file);
  }

  function sortDocumentPaths(paths) {
    return Array.from(new Set(paths))
      .filter(isMarkdownPath)
      .sort(function (left, right) {
        return left.localeCompare(right, undefined, {
          numeric: true,
          sensitivity: "base"
        });
      });
  }

  function titleFromMarkdown(file, markdown) {
    var match = markdown.match(/^#\s+(.+?)\s*#*\s*$/m);
    return match ? match[1].trim() : titleFromFilename(file);
  }

  async function fetchMarkdown(file) {
    if (markdownCache.has(file)) {
      return markdownCache.get(file);
    }

    var response = await fetch(getEncodedPath(file), { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Could not load " + file + " (" + response.status + ")");
    }

    var markdown = await response.text();
    markdownCache.set(file, markdown);
    return markdown;
  }

  function getGithubRepo() {
    var githubPagesMatch = window.location.hostname.match(/^(.+)\.github\.io$/i);
    var repoFromPath = window.location.pathname.split("/").filter(Boolean)[0];

    if (githubPagesMatch && repoFromPath) {
      return githubPagesMatch[1] + "/" + repoFromPath;
    }

    return GITHUB_REPO;
  }

  async function discoverFromGithubContents() {
    var repo = getGithubRepo();
    var apiUrl = "https://api.github.com/repos/" + repo + "/contents/" + DOCS_PATH.replace(/\/$/, "");
    var response = await fetch(apiUrl, {
      cache: "no-cache",
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error("Could not list " + DOCS_PATH + " from GitHub (" + response.status + ")");
    }

    var entries = await response.json();
    if (!Array.isArray(entries)) {
      throw new Error("GitHub did not return a directory listing for " + DOCS_PATH);
    }

    return sortDocumentPaths(
      entries
        .filter(function (entry) {
          return entry.type === "file" && typeof entry.path === "string";
        })
        .map(function (entry) {
          return entry.path;
        })
    );
  }

  async function discoverFromDirectoryListing() {
    var response = await fetch(DOCS_PATH, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Could not list " + DOCS_PATH + " locally (" + response.status + ")");
    }

    var html = await response.text();
    var parsed = new DOMParser().parseFromString(html, "text/html");
    var directoryUrl = new URL(DOCS_PATH, window.location.href);
    var pageBasePath = new URL(".", window.location.href).pathname.replace(/^\/+/, "");

    return sortDocumentPaths(
      Array.from(parsed.querySelectorAll("a[href]"))
        .map(function (link) {
          var url = new URL(link.getAttribute("href"), directoryUrl);
          if (url.origin !== window.location.origin) {
            return "";
          }

          var path = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
          return pageBasePath && path.startsWith(pageBasePath)
            ? path.slice(pageBasePath.length)
            : path;
        })
    );
  }

  async function discoverDocumentPaths() {
    if (window.location.protocol === "file:") {
      throw new Error("Open this page through a local server or GitHub Pages so it can read docs/.");
    }

    var isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname === "::1";

    var discoveries = isLocal
      ? [discoverFromDirectoryListing, discoverFromGithubContents]
      : [discoverFromGithubContents, discoverFromDirectoryListing];
    var lastError;

    for (var index = 0; index < discoveries.length; index += 1) {
      try {
        var paths = await discoveries[index]();
        if (paths.length) {
          return paths;
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No Markdown files found in " + DOCS_PATH);
  }

  async function loadDocuments() {
    var paths = await discoverDocumentPaths();

    return paths
      .filter(function (file) {
        return typeof file === "string" && file.trim();
      })
      .map(function (file) {
        return { file: file.trim(), title: titleFromFilename(file) };
      });
  }

  function getRequestedFile() {
    var hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    var match = documents.find(function (doc) {
      return doc.file === hash;
    });

    return match ? match.file : documents[0] && documents[0].file;
  }

  function updateActiveNav(file) {
    var buttons = documentList.querySelectorAll("button[data-file]");
    buttons.forEach(function (button) {
      var isActive = button.dataset.file === file;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function renderNav() {
    documentList.innerHTML = "";

    documents.forEach(function (doc, index) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      var chapter = document.createElement("span");
      var title = document.createElement("span");
      var filename = doc.file.split("/").pop() || doc.file;
      var chapterMatch = filename.match(/^\d+/);

      button.type = "button";
      button.dataset.file = doc.file;
      button.className = "document-link";
      chapter.className = "document-index";
      title.className = "document-title";
      chapter.textContent = chapterMatch ? chapterMatch[0] : String(index + 1).padStart(2, "0");
      title.textContent = doc.title;

      button.appendChild(chapter);
      button.appendChild(title);
      button.addEventListener("click", function () {
        if (window.location.hash !== "#" + encodeURIComponent(doc.file)) {
          window.location.hash = encodeURIComponent(doc.file);
        } else {
          loadDocument(doc.file);
        }
      });

      item.appendChild(button);
      documentList.appendChild(item);
    });
  }

  function renderMarkdown(markdown) {
    if (!window.marked || !window.DOMPurify) {
      throw new Error("Markdown renderer could not be loaded.");
    }

    window.marked.setOptions({
      breaks: false,
      gfm: true
    });

    reader.className = "markdown-body";
    reader.innerHTML = window.DOMPurify.sanitize(window.marked.parse(markdown));
  }

  async function loadDocument(file) {
    var doc = documents.find(function (entry) {
      return entry.file === file;
    });

    if (!doc) {
      return;
    }

    setReaderState("Loading...");
    updateActiveNav(file);

    try {
      var markdown = await fetchMarkdown(file);
      doc.title = titleFromMarkdown(file, markdown);
      document.title = doc.title + " - " + SITE_TITLE;
      renderNav();
      updateActiveNav(file);
      renderMarkdown(markdown);
      reader.scrollTop = 0;
      document.querySelector(".content-shell").scrollTop = 0;
    } catch (error) {
      document.title = SITE_TITLE;
      setReaderState(error.message, "error");
    }
  }

  async function hydrateTitles() {
    await Promise.all(
      documents.map(async function (doc) {
        try {
          var markdown = await fetchMarkdown(doc.file);
          doc.title = titleFromMarkdown(doc.file, markdown);
        } catch (error) {
          doc.title = titleFromFilename(doc.file);
        }
      })
    );
  }

  async function init() {
    try {
      documents = await loadDocuments();
      if (!documents.length) {
        setReaderState("No documents found.", "error");
        return;
      }

      await hydrateTitles();
      renderNav();
      loadDocument(getRequestedFile());
    } catch (error) {
      setReaderState(error.message, "error");
    }
  }

  window.addEventListener("hashchange", function () {
    loadDocument(getRequestedFile());
  });

  init();
})();
