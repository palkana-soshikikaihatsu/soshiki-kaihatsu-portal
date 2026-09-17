(function () {
  const DATA = window.DX_TASK_DATA || { hub: {}, seasons: {} };
  const rootAttr = document.documentElement.dataset.root || ".";
  const dxBase = `${rootAttr}/dx`;

  function esc(value) {
    if (typeof window.escapeHtml === "function") return window.escapeHtml(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toEmbedUrl(input) {
    const raw = String(input || "").trim();
    if (!raw) return "";
    const slides = raw.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slides) {
      if (/\/embed(\?|$)/.test(raw)) return raw;
      return `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false&delayms=3000`;
    }
    const file = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (file) {
      if (/\/preview(\?|$)/.test(raw)) return raw;
      return `https://drive.google.com/file/d/${file[1]}/preview`;
    }
    if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) {
      return `https://drive.google.com/file/d/${raw}/preview`;
    }
    return raw;
  }

  function toOpenUrl(input) {
    const raw = String(input || "").trim();
    if (!raw) return "";
    const slides = raw.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slides) return `https://docs.google.com/presentation/d/${slides[1]}/present`;
    const file = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (file) return `https://drive.google.com/file/d/${file[1]}/view`;
    if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) return `https://drive.google.com/file/d/${raw}/view`;
    return raw;
  }

  function seasonList() {
    return Object.keys(DATA.seasons || {}).map((id) => DATA.seasons[id]);
  }

  function memberLabel(member) {
    const name = `${member.name || ""}さん`;
    return member.role ? `${name}（${member.role}）` : name;
  }

  function renderSubnav(activeId) {
    const items = [
      { id: "hub", href: `${dxBase}/index.html#task`, label: "DX推進トップ" },
      ...seasonList().map((s) => ({
        id: s.id,
        href: `${dxBase}/${s.href}`,
        label: s.label
      }))
    ];
    return `
      <nav class="dx-subnav" aria-label="DX推進会議のページ">
        ${items.map((item) => `
          <a class="${item.id === activeId ? "is-active" : ""}" href="${item.href}">${esc(item.label)}</a>
        `).join("")}
      </nav>`;
  }

  function renderEmbed(media) {
    const title = esc(media.title || (media.type === "video" ? "発表動画" : "資料"));
    const embed = toEmbedUrl(media.url);
    const open = toOpenUrl(media.url);
    if (!embed) {
      return `
        <div class="dx-embed is-empty">
          <div class="dx-embed-bar"><span>${title}</span></div>
          <div class="dx-embed-empty">
            <strong>公開準備中</strong>
            <p>GoogleドライブのURLが追加されると、ここに埋め込まれます。</p>
          </div>
        </div>`;
    }
    const ratio = media.type === "slides" ? "slides" : "video";
    return `
      <div class="dx-embed">
        <div class="dx-embed-bar">
          <span>${title}</span>
          <a href="${esc(open)}" target="_blank" rel="noopener">新しいタブで開く</a>
        </div>
        <div class="dx-embed-frame is-${ratio}">
          <iframe src="${esc(embed)}" title="${title}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>`;
  }

  function renderTeam(team, index) {
    const members = (team.members || []).map((m) => `<li>${esc(memberLabel(m))}</li>`).join("");
    const media = (team.media || []).map(renderEmbed).join("");
    return `
      <article class="dx-team" id="team-${esc(team.id)}" style="--i:${index}">
        <div class="dx-team-head">
          <p class="dx-team-code">${esc(team.code)}</p>
          <div>
            <p class="dx-team-theme">${esc(team.theme || "")}</p>
            <h3>${esc(team.name)}　${esc(team.app)}</h3>
            <p class="dx-team-summary">${esc(team.summary || "")}</p>
          </div>
        </div>
        <ul class="dx-members">${members}</ul>
        <div class="dx-media-grid">${media}</div>
      </article>`;
  }

  function renderStory(story) {
    if (!story) return "";
    const steps = (story.steps || []).map((step) => `
      <article class="dx-step-card">
        <span>${esc(step.no)}</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.text)}</p>
      </article>`).join("");
    const cases = (story.cases || []).map((item) => `
      <article class="dx-case-card">
        <strong>${esc(item.team)}</strong>
        <h3>${esc(item.app)}</h3>
        <p>${esc(item.text)}</p>
      </article>`).join("");
    const roadmap = (story.roadmap || []).map((item) => `
      <article class="dx-road-card">
        <span>${esc(item.when)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
      </article>`).join("");
    return `
      <section class="section dx-story">
        <div class="container">
          <p class="dx-kicker">Field-driven DX</p>
          <h2 class="section-title">${esc(story.title)}</h2>
          <div class="dx-before-after">
            <p><strong>Before</strong>${esc(story.introBefore)}</p>
            <p><strong>After</strong>${esc(story.introAfter)}</p>
          </div>
          <h3 class="dx-block-title">${esc(story.stepsTitle)}</h3>
          <p class="section-lead">${esc(story.stepsLead)}</p>
          <div class="dx-step-grid">${steps}</div>
          <h3 class="dx-block-title">${esc(story.casesTitle)}</h3>
          <div class="dx-case-grid">${cases}</div>
          <h3 class="dx-block-title">${esc(story.resultTitle)}</h3>
          <p class="dx-result">${esc(story.result)}</p>
          <div class="dx-road-grid">${roadmap}</div>
        </div>
      </section>`;
  }

  function renderOverview(overview) {
    if (!overview || (!overview.slidesUrl && !overview.title)) return "";
    return `
      <section class="section band">
        <div class="container">
          <p class="dx-kicker">Overview Deck</p>
          <h2 class="section-title">${esc(overview.title || "推進ストーリー（スライド）")}</h2>
          <p class="section-lead">スライドで、現場主導のDX推進をわかりやすく紹介します。</p>
          <div class="dx-overview">${renderEmbed({ type: "slides", title: overview.title || "概要スライド", url: overview.slidesUrl })}</div>
        </div>
      </section>`;
  }

  function renderHub(target) {
    if (!target) return;
    const hub = DATA.hub || {};
    const seasons = seasonList();
    const first = DATA.seasons["2025h2"];
    const firstCount = ((first && first.teams) || []).reduce((n, t) => n + (t.members || []).length, 0);
    const cards = seasons.map((s) => `
      <a class="dx-season-card accent-${esc(s.accent || "cyan")}" href="${dxBase}/${s.href}">
        <span class="dx-season-status">${esc(s.statusLabel)}</span>
        <strong>SEASON 0${esc(String(s.seasonNo))}</strong>
        <h3>${esc(s.label)}</h3>
        <p>${esc(s.lead)}</p>
        <span class="dx-season-more">${s.status === "ongoing" ? "進捗を見る" : "発表会を見る"} →</span>
      </a>`).join("");
    target.innerHTML = `
      ${renderSubnav("hub")}
      <div class="dx-hub-copy">
        <p class="dx-kicker">${esc(hub.kicker || "DX Promotion Task")}</p>
        <h2>${esc(hub.title)}</h2>
        <p>${esc(hub.lead)}</p>
      </div>
      <div class="dx-stat-row">
        <div><b>${esc(hub.seasonCount)}</b><span>シーズン</span></div>
        <div><b>${esc(hub.totalMembers)}</b><span>参加メンバー</span></div>
        <div><b>${esc(firstCount || "—")}</b><span>2025下期メンバー</span></div>
        <div><b>NOW</b><span>2026上期 進行中</span></div>
      </div>
      <div class="dx-season-grid">${cards}</div>`;
  }

  function renderSeason(target, seasonId) {
    if (!target) return;
    const season = DATA.seasons[seasonId];
    if (!season) {
      target.innerHTML = `<div class="container section"><p class="status-msg">指定されたシーズンが見つかりません。</p></div>`;
      return;
    }
    const teams = season.teams || [];
    const toc = teams.map((t) => `<a href="#team-${esc(t.id)}">${esc(t.code)}</a>`).join("");
    const teamHtml = teams.length
      ? teams.map(renderTeam).join("")
      : `
        <div class="dx-empty-season">
          <p class="dx-kicker">Coming soon</p>
          <h3>発表会の埋め込みを準備しています</h3>
          <p>チーム名・メンバー・発表資料・動画が揃い次第、このページでご覧いただけるようにします。</p>
        </div>`;

    target.innerHTML = `
      <section class="hero hero-dx-task">
        <div class="hero-orb a"></div>
        <div class="hero-orb b"></div>
        <div class="dx-grid-bg" aria-hidden="true"></div>
        <div class="container hero-inner">
          <p class="hero-kicker">${esc(season.statusLabel)}</p>
          <h1>${esc(season.eventTitle)}</h1>
          <p>${esc(season.lead)}</p>
          <div class="hero-actions">
            ${teams.length ? `<a class="btn btn-white" href="#teams">各チームの発表</a>` : ""}
            <a class="btn btn-ghost" href="${dxBase}/index.html#task">シーズン一覧へ</a>
          </div>
          <dl class="dx-meta">
            <div><dt>期間</dt><dd>${esc(season.period)}</dd></div>
            <div><dt>発表会</dt><dd>${esc(season.eventDate || "日程調整中")}</dd></div>
            <div><dt>チーム</dt><dd>${teams.length ? `${teams.length}チーム` : "編成中"}</dd></div>
          </dl>
        </div>
      </section>
      <div class="container dx-season-navwrap">
        <p class="breadcrumb"><a href="${rootAttr}/index.html">ホーム</a> / <a href="${dxBase}/index.html">DX推進</a> / ${esc(season.label)}</p>
        ${renderSubnav(season.id)}
      </div>
      ${renderStory(season.story)}
      ${renderOverview(season.overview)}
      <section class="section dx-teams-band" id="teams">
        <div class="container">
          <p class="dx-kicker">Team Showcase</p>
          <h2 class="section-title dx-on-dark">ーDX推進タスクー　各チームの成果発表</h2>
          <p class="section-lead dx-on-dark">${teams.length ? "発表資料と当日の動画を、チームごとにご覧いただけます。" : "第2シーズンの成果は、準備ができ次第こちらに公開します。"}</p>
          ${toc ? `<nav class="dx-toc">${toc}</nav>` : ""}
          ${teamHtml}
        </div>
      </section>`;
  }

  window.DXTask = {
    renderHub,
    renderSeason,
    toEmbedUrl
  };
})();
