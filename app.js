(function () {
  "use strict";

  var SITE_TITLE = "Understanding the Backend Development Fundamentals";
  var manifestPath = "docs.json";
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

  async function loadManifest() {
    var response = await fetch(manifestPath, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Could not load " + manifestPath + " (" + response.status + ")");
    }

    var manifest = await response.json();
    if (!Array.isArray(manifest.documents)) {
      throw new Error("docs.json must contain a documents array.");
    }

    return manifest.documents
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

    documents.forEach(function (doc) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      var chapter = document.createElement("span");
      var title = document.createElement("span");

      button.type = "button";
      button.dataset.file = doc.file;
      button.className = "document-link";
      chapter.className = "document-index";
      title.className = "document-title";
      chapter.textContent = doc.file.match(/^\d+/)
        ? doc.file.match(/^\d+/)[0]
        : String(documentList.children.length + 1).padStart(2, "0");
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
      documents = await loadManifest();
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
