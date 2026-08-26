(function () {
  const cfg = window.PORTAL_CONFIG || {};
  const SESSION_KEY = cfg.sessionKey || "od_portal_session";

  const DEMO_POSTS = [
    {
      id: "demo-1",
      title: "組織開発課ポータルを公開しました",
      category: "お知らせ",
      body: "職員の皆さまへ。\n\n組織開発課の取り組みを一覧できるポータルサイトを公開しました。\n\n- **DX推進特設ページ** で考え方と実践ステップを共有します\n- **いいね！パルプロジェクト** への導線を設けています\n- このお知らせ欄から、課からの発信を随時更新します\n\nご意見・ご相談は組織開発課までお寄せください。",
      published: true,
      author: "組織開発課",
      createdAt: "2026-04-01T09:00:00+09:00",
      updatedAt: "2026-04-01T09:00:00+09:00",
      attachments: [],
      demo: true
    }
  ];

  function gasConfigured() {
    return Boolean(cfg.gasUrl && cfg.gasUrl.indexOf("http") === 0);
  }

  async function request(payload) {
    if (!gasConfigured()) {
      return handleDemo(payload);
    }
    const res = await fetch(cfg.gasUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error("サーバー応答を解析できませんでした。GASのデプロイ設定を確認してください。");
    }
  }

  function handleDemo(payload) {
    const action = payload.action;
    if (action === "listPosts" || action === "adminListPosts") {
      return Promise.resolve({ ok: true, demo: true, posts: DEMO_POSTS });
    }
    if (action === "getPost") {
      const post = DEMO_POSTS.find((p) => p.id === payload.id) || DEMO_POSTS[0];
      return Promise.resolve({ ok: true, demo: true, post });
    }
    return Promise.resolve({
      ok: false,
      demo: true,
      error: "バックエンド未設定のため、投稿・ログインはできません。gas/README.md の手順でGASを接続してください。"
    });
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(session) {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  window.PortalAPI = {
    gasConfigured,
    request,
    getSession,
    setSession,
    async listPosts() {
      const data = await request({ action: "listPosts" });
      if (!data.ok) throw new Error(data.error || "お知らせを取得できませんでした");
      return data;
    },
    async getPost(id, token) {
      const data = await request({ action: "getPost", id, token });
      if (!data.ok) throw new Error(data.error || "記事を取得できませんでした");
      return data.post;
    },
    async login(username, password) {
      const data = await request({ action: "login", username, password });
      if (!data.ok) throw new Error(data.error || "ログインに失敗しました");
      setSession({ token: data.token, username: data.username, expiresAt: data.expiresAt });
      return data;
    },
    async logout() {
      const session = getSession();
      if (session && session.token) {
        try { await request({ action: "logout", token: session.token }); } catch (e) { /* ignore */ }
      }
      setSession(null);
    },
    async adminListPosts() {
      const session = getSession();
      const data = await request({ action: "adminListPosts", token: session && session.token });
      if (!data.ok) throw new Error(data.error || "一覧を取得できませんでした");
      return data.posts;
    },
    async savePost(post) {
      const session = getSession();
      const data = await request({
        action: post.id ? "updatePost" : "createPost",
        token: session && session.token,
        post
      });
      if (!data.ok) throw new Error(data.error || "保存に失敗しました");
      return data.post;
    },
    async deletePost(id) {
      const session = getSession();
      const data = await request({ action: "deletePost", token: session && session.token, id });
      if (!data.ok) throw new Error(data.error || "削除に失敗しました");
      return data;
    },
    async uploadAttachment(postId, file, base64) {
      const session = getSession();
      const data = await request({
        action: "uploadAttachment",
        token: session && session.token,
        postId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        data: base64
      });
      if (!data.ok) throw new Error(data.error || "アップロードに失敗しました");
      return data.attachment;
    },
    async deleteAttachment(id) {
      const session = getSession();
      const data = await request({ action: "deleteAttachment", token: session && session.token, id });
      if (!data.ok) throw new Error(data.error || "添付の削除に失敗しました");
      return data;
    },
    readAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const comma = result.indexOf(",");
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
        reader.readAsDataURL(file);
      });
    }
  };
})();
