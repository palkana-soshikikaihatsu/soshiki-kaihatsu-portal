(function () {
  const listEl = document.getElementById("news-list");
  const articleEl = document.getElementById("article");

  function renderAttachments(attachments) {
    if (!attachments || !attachments.length) return "";
    const images = attachments.filter((a) => (a.mimeType || "").startsWith("image/"));
    const files = attachments.filter((a) => !(a.mimeType || "").startsWith("image/"));
    const imageHtml = images.map((a) => {
      const url = fileUrl(a);
      return `<figure class="image-attach"><img src="${url}" alt="${escapeHtml(a.name || "")}"><figcaption>${escapeHtml(a.name || "画像")}</figcaption></figure>`;
    }).join("");
    const fileHtml = files.map((a) => {
      const url = fileUrl(a);
      return `<a class="file-chip" href="${url}" target="_blank" rel="noopener"><span>${escapeHtml(a.name || "ファイル")}</span><span>開く</span></a>`;
    }).join("");
    return `<div class="attachments">${imageHtml}${fileHtml}</div>`;
  }

  if (listEl) {
    PortalAPI.listPosts().then((data) => {
      const posts = data.posts || [];
      if (!posts.length) {
        listEl.innerHTML = '<div class="empty-state">まだお知らせはありません。</div>';
        return;
      }
      listEl.innerHTML = posts.map((post) => {
        const cover = coverOf(post);
        const demo = post.demo ? '<span class="badge badge-demo">デモ</span>' : `<span class="badge">${escapeHtml(post.category || "お知らせ")}</span>`;
        return `<a class="news-item" href="detail.html?id=${encodeURIComponent(post.id)}">
          <div class="news-thumb">${cover ? `<img src="${cover}" alt="">` : "NEWS"}</div>
          <div class="news-body">
            <div class="news-meta">${demo}<span>${formatDate(post.createdAt)}</span></div>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml((post.body || "").replace(/\s+/g, " ").slice(0, 120))}…</p>
          </div>
        </a>`;
      }).join("");
    }).catch((err) => {
      listEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
    });
  }

  if (articleEl) {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
      articleEl.innerHTML = '<div class="empty-state">記事が指定されていません。</div>';
      return;
    }
    PortalAPI.getPost(id).then((post) => {
      document.title = `${post.title} | 組織開発課ポータル`;
      articleEl.innerHTML = `
        <div class="news-meta">
          <span class="badge">${escapeHtml(post.category || "お知らせ")}</span>
          <span>${formatDate(post.createdAt)}</span>
          ${post.author ? `<span>${escapeHtml(post.author)}</span>` : ""}
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="article-body">${renderMarkdown(post.body || "")}</div>
        ${renderAttachments(post.attachments)}
      `;
    }).catch((err) => {
      articleEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
    });
  }
})();
