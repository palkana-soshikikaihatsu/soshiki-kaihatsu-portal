(function () {
  const root = document.documentElement.dataset.root || ".";
  const cfg = window.PORTAL_CONFIG || {};
  const iine = cfg.iinePalUrl || "https://palkana-soshikikaihatsu.github.io/soshikikaihatsu.github.io/";
  const active = document.body.dataset.page || "";

  function link(href, label, key) {
    const cls = key === active ? " is-active" : "";
    return `<a class="${cls.trim()}" href="${root}/${href}">${label}</a>`;
  }

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="container header-inner">
        <a class="logo" href="${root}/index.html">
          <span class="logo-mark">OD</span>
          <span class="logo-text">
            <small>パルシステム神奈川</small>
            <strong>組織開発課ポータル</strong>
          </span>
        </a>
        <button class="nav-toggle" type="button" aria-label="メニュー"><span></span><span></span><span></span></button>
        <nav class="site-nav" id="site-nav">
          ${link("index.html", "ホーム", "home")}
          ${link("dx/index.html", "DX推進", "dx")}
          <a class="nav-ext" href="${iine}" target="_blank" rel="noopener">いいねパル</a>
          ${link("news/index.html", "お知らせ", "news")}
          ${link("admin/index.html", "管理者", "admin")}
        </nav>
      </div>`;
    const toggle = header.querySelector(".nav-toggle");
    const nav = header.querySelector("#site-nav");
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="container footer-inner">
        <div>
          <h3>パルシステム神奈川 人事部 組織開発課</h3>
          <p>〒222-0033 神奈川県横浜市港北区新横浜3-18-16 新横浜交通ビル4F</p>
        </div>
        <div>
          <p><span style="opacity:.7;margin-right:8px">TEL</span> 045-470-5314</p>
          <p><span style="opacity:.7;margin-right:8px">MAIL</span> <a href="mailto:palkana-soshikikaihatsu@pal.or.jp">palkana-soshikikaihatsu@pal.or.jp</a></p>
        </div>
      </div>`;
  }

  window.escapeHtml = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  window.formatDate = function (value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  window.renderMarkdown = function (src) {
    const escaped = window.escapeHtml(src || "");
    const html = escaped
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h2>$1</h2>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^(?:- |\* )(.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
    return html
      .split(/\n{2,}/)
      .map((block) => {
        if (/^\s*<(h2|h3|ul|p)/.test(block)) return block;
        return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");
  };

  window.fileUrl = function (att) {
    if (!att) return "";
    if (att.url) return att.url;
    if (att.driveFileId) {
      if ((att.mimeType || "").startsWith("image/")) {
        return `https://lh3.googleusercontent.com/d/${att.driveFileId}`;
      }
      return `https://drive.google.com/uc?export=download&id=${att.driveFileId}`;
    }
    return "";
  };

  window.coverOf = function (post) {
    const images = (post.attachments || []).filter((a) => (a.mimeType || "").startsWith("image/"));
    return images[0] ? window.fileUrl(images[0]) : "";
  };
})();
