(function () {
  const app = document.getElementById("admin-app");
  const cfg = window.PORTAL_CONFIG || {};
  let view = "list";
  let editing = null;
  let pendingFiles = [];
  let message = "";

  function sessionValid() {
    const s = PortalAPI.getSession();
    if (!s || !s.token) return false;
    if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) {
      PortalAPI.setSession(null);
      return false;
    }
    return true;
  }

  function setMsg(text) {
    message = text || "";
    render();
  }

  function render() {
    if (!sessionValid()) {
      app.innerHTML = loginView();
      bindLogin();
      return;
    }
    if (view === "edit") {
      app.innerHTML = editorView();
      bindEditor();
      return;
    }
    app.innerHTML = `<div class="status-msg">読み込み中…</div>`;
    PortalAPI.adminListPosts().then((posts) => {
      app.innerHTML = listView(posts);
      bindList();
    }).catch((err) => {
      if (/認証|ログイン|token/i.test(err.message)) {
        PortalAPI.setSession(null);
        render();
        return;
      }
      app.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>
        <p><button class="btn btn-outline" id="logout-btn" type="button">ログアウト</button></p>`;
      document.getElementById("logout-btn").onclick = async () => {
        await PortalAPI.logout();
        render();
      };
    });
  }

  function loginView() {
    const warn = PortalAPI.gasConfigured()
      ? ""
      : `<p class="error">GASのURLが未設定です。<code>assets/js/config.js</code> の gasUrl を設定してください。</p>`;
    return `
      <div class="login-wrap">
        <h1>管理者ログイン</h1>
        <p class="section-lead">組織開発課のお知らせを投稿・編集します。</p>
        <form class="form-card" id="login-form">
          ${warn}
          <label for="username">ユーザー名</label>
          <input id="username" name="username" type="text" autocomplete="username" required>
          <label for="password">パスワード</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">ログイン</button>
          </div>
          <p class="error" id="login-error">${escapeHtml(message)}</p>
        </form>
      </div>`;
  }

  function bindLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = form.username.value.trim();
      const password = form.password.value;
      try {
        await PortalAPI.login(username, password);
        message = "";
        view = "list";
        render();
      } catch (err) {
        document.getElementById("login-error").textContent = err.message;
      }
    });
  }

  function listView(posts) {
    const rows = (posts || []).map((p) => `
      <tr>
        <td>${escapeHtml(formatDate(p.createdAt))}</td>
        <td>${escapeHtml(p.title)}</td>
        <td>${p.published ? '<span class="badge">公開</span>' : '<span class="badge badge-draft">下書き</span>'}</td>
        <td>
          <button class="btn btn-outline btn-sm" data-edit="${p.id}" type="button">編集</button>
          <button class="btn btn-danger btn-sm" data-del="${p.id}" type="button">削除</button>
        </td>
      </tr>`).join("");
    return `
      <div class="admin-toolbar">
        <div>
          <h1>お知らせ管理</h1>
          <p class="section-lead">投稿、画像・資料の添付、公開／下書きを切り替えできます。</p>
        </div>
        <div>
          <button class="btn btn-primary" id="new-post" type="button">新規投稿</button>
          <button class="btn btn-outline" id="logout-btn" type="button">ログアウト</button>
        </div>
      </div>
      ${message ? `<p class="ok">${escapeHtml(message)}</p>` : ""}
      <div style="overflow:auto">
        <table class="table">
          <thead><tr><th>日付</th><th>タイトル</th><th>状態</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">まだ投稿がありません。</td></tr>'}</tbody>
        </table>
      </div>`;
  }

  function bindList() {
    document.getElementById("logout-btn").onclick = async () => {
      await PortalAPI.logout();
      render();
    };
    document.getElementById("new-post").onclick = () => {
      editing = { title: "", body: "", category: "お知らせ", published: true, attachments: [] };
      pendingFiles = [];
      view = "edit";
      render();
    };
    app.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.onclick = async () => {
        editing = await PortalAPI.getPost(btn.dataset.edit, PortalAPI.getSession().token);
        pendingFiles = [];
        view = "edit";
        render();
      };
    });
    app.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm("このお知らせを削除しますか？")) return;
        await PortalAPI.deletePost(btn.dataset.del);
        message = "削除しました。";
        render();
      };
    });
  }

  function editorView() {
    const atts = (editing.attachments || []).map((a) => `
      <div class="file-chip">
        <span>${escapeHtml(a.name)}</span>
        <button class="btn btn-outline btn-sm" data-att-del="${a.id}" type="button">削除</button>
      </div>`).join("");
    const queued = pendingFiles.map((f, i) => `<div class="file-chip"><span>${escapeHtml(f.name)}（未アップロード）</span><button class="btn btn-outline btn-sm" data-qdel="${i}" type="button">取消</button></div>`).join("");
    return `
      <div class="admin-toolbar">
        <h1>${editing.id ? "お知らせを編集" : "新規投稿"}</h1>
        <button class="btn btn-outline" id="back-list" type="button">一覧へ</button>
      </div>
      <form class="form-card" id="post-form">
        <label for="title">タイトル</label>
        <input id="title" name="title" type="text" required value="${escapeHtml(editing.title || "")}">
        <label for="category">カテゴリ</label>
        <select id="category" name="category">
          ${["お知らせ", "研修", "DX", "プロジェクト", "イベント"].map((c) => `<option ${editing.category === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
        <label for="body">本文（見出しは ## 、太字は **文字**）</label>
        <textarea id="body" name="body">${escapeHtml(editing.body || "")}</textarea>
        <label><input type="checkbox" id="published" ${editing.published ? "checked" : ""}> 公開する</label>
        <label>画像・ファイル</label>
        <div class="dropzone" id="dropzone">ここにファイルをドロップ、またはクリックして選択<br><small>1ファイル ${Math.round(cfg.maxFileBytes / 1024 / 1024)}MBまで（画像・PDF・Office・ZIP）</small>
          <input id="file-input" type="file" multiple hidden>
        </div>
        <div class="file-list">${atts}${queued}</div>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">保存</button>
        </div>
        <p class="error" id="edit-error">${escapeHtml(message)}</p>
      </form>`;
  }

  function bindEditor() {
    document.getElementById("back-list").onclick = () => {
      view = "list";
      message = "";
      render();
    };
    const drop = document.getElementById("dropzone");
    const input = document.getElementById("file-input");
    drop.addEventListener("click", () => input.click());
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("is-over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("is-over");
      addFiles(e.dataTransfer.files);
    });
    input.addEventListener("change", () => addFiles(input.files));
    app.querySelectorAll("[data-qdel]").forEach((btn) => {
      btn.onclick = () => {
        captureForm();
        pendingFiles.splice(Number(btn.dataset.qdel), 1);
        render();
      };
    });
    app.querySelectorAll("[data-att-del]").forEach((btn) => {
      btn.onclick = async () => {
        captureForm();
        if (!confirm("この添付を削除しますか？")) return;
        await PortalAPI.deleteAttachment(btn.dataset.attDel);
        editing.attachments = (editing.attachments || []).filter((a) => a.id !== btn.dataset.attDel);
        render();
      };
    });
    document.getElementById("post-form").addEventListener("submit", onSave);
  }

  function captureForm() {
    const form = document.getElementById("post-form");
    if (!form || !editing) return;
    editing.title = form.title.value;
    editing.body = form.body.value;
    editing.category = form.category.value;
    editing.published = document.getElementById("published").checked;
  }

  function addFiles(fileList) {
    captureForm();
    const allowed = (cfg.allowedExtensions || []).map((x) => x.toLowerCase());
    const next = Array.from(fileList);
    for (const file of next) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (allowed.length && !allowed.includes(ext)) {
        message = `${file.name} は許可されていない形式です。`;
        render();
        return;
      }
      if (file.size > (cfg.maxFileBytes || 8 * 1024 * 1024)) {
        message = `${file.name} がサイズ上限を超えています。`;
        render();
        return;
      }
      pendingFiles.push(file);
    }
    message = "";
    render();
  }

  async function onSave(e) {
    e.preventDefault();
    const form = e.target;
    const err = document.getElementById("edit-error");
    err.textContent = "保存しています…";
    try {
      const saved = await PortalAPI.savePost({
        id: editing.id,
        title: form.title.value.trim(),
        body: form.body.value,
        category: form.category.value,
        published: document.getElementById("published").checked
      });
      editing = saved;
      for (const file of pendingFiles) {
        err.textContent = `${file.name} をアップロード中…`;
        const base64 = await PortalAPI.readAsBase64(file);
        const att = await PortalAPI.uploadAttachment(saved.id, file, base64);
        editing.attachments = editing.attachments || [];
        editing.attachments.push(att);
      }
      pendingFiles = [];
      message = "保存しました。";
      view = "list";
      render();
    } catch (ex) {
      err.textContent = ex.message;
    }
  }

  render();
})();
