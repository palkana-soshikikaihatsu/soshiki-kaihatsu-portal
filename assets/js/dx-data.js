/**
 * DX推進会議 / 成果発表会のデータ。
 *
 * 動画や資料を追加するときは、このファイルだけ編集してください。
 * url には次のいずれかを貼れます。
 *   - Googleドライブの共有リンク（https://drive.google.com/file/d/FILE_ID/view）
 *   - GoogleスライドのURL（https://docs.google.com/presentation/d/ID/edit）
 *   - ファイルIDだけ
 * 空文字 "" のままだと「公開準備中」のプレースホルダが表示されます。
 *
 * 新しいチームを足すときは、ファイル末尾の DX_TEAM_TEMPLATE をコピーして
 * seasons["2026h1"].teams に追加してください。
 */
window.DX_TASK_DATA = {
  hub: {
    kicker: "DX Promotion Task",
    title: "DX推進会議　成果発表会",
    lead: "現場の課題を、現場の手でアプリにして解く。2025年度下期に発足し、現在は2シーズン目。これまでに45名が推進メンバーとして参加しています。",
    totalMembers: 45,
    seasonCount: 2
  },
  seasons: {
    "2025h2": {
      id: "2025h2",
      href: "2025h2/index.html",
      label: "2025年度 下期",
      seasonNo: 1,
      status: "published",
      statusLabel: "Season 01 / 公開中",
      period: "2025年10月 — 2026年3月",
      eventDate: "2026年3月12日",
      eventTitle: "DX推進タスクメンバーの成果発表会",
      accent: "cyan",
      lead: "職場で抱える課題に対して、自分たちでアプリを開発し解決する。タスク結成から約半年間の試行錯誤の先に、各チームがすばらしいアプリをつくりあげました。",
      overview: {
        title: "データとデジタルで仕事楽しく組織を強く",
        slidesUrl: "https://drive.google.com/file/d/1xuqOvuNvsKJMC4bkOHK2tSAKtMV5DQ6v/view"
      },
      story: {
        title: "パルシステム神奈川の挑戦：現場主導のDX推進ストーリー",
        introBefore: "かつての私たちの職場は、紙の伝票や手作業での集計といった「紙と手作業の山」に囲まれ、経験と勘に依存した属人的な業務が多数存在していました。",
        introAfter: "目指したのは、単なるツールの導入ではなく、「データと技術を使って、働き方そのものを変えること」です。",
        stepsTitle: "組織を変える「DX推進の4つのステップ」",
        stepsLead: "「誰かがやってくれる」ではなく、現場が自らの手で解決する風土をつくるため、次のステップで推進しました。",
        steps: [
          { no: "01", title: "現状を知る", text: "全職員を対象にITリテラシーテストを実施し、勘に頼らず客観的なデータから現場の隠れた才能を発掘しました。" },
          { no: "02", title: "推進体制を作る", text: "テスト結果と熱意に基づき、多様な部署から変革の推進リーダーを選抜しました。" },
          { no: "03", title: "小さく始める", text: "いきなり大きなシステムを入れるのではなく、「まずは小さく試す」「失敗してもOK」のマインドで成功体験を積み重ねました。" },
          { no: "04", title: "共有し、徐々に拡大", text: "事務局主導から現場主導の開発へシフトし、成功も失敗もオープンにして組織全体の知識にしました。" }
        ],
        casesTitle: "現場で生まれたアプリ",
        cases: [
          { team: "Alpha", app: "GAZN（画ゾーン）", text: "数千枚の写真からキーワードで瞬時に検索できるフォトライブラリー。画像検索を数十分から数秒へ。" },
          { team: "Bravo", app: "Quest", text: "依頼と進捗を可視化し、未完了者への自動通知でタスク漏れと催促のストレスを解消。" },
          { team: "Charlie", app: "どられぽ", text: "紙の運転月報をデジタル入力にし、月末締め作業を効率化。データに基づく安全管理へ。" },
          { team: "Delta", app: "ケアパル", text: "スマホ完結の直行直帰ヘルパー活動報告。移動距離や時間から交通費・給与計算の基礎データを自動生成。" },
          { team: "横断", app: "ハタラクト", text: "複雑な紙の承認ルートをアプリ化。申請から承認までの期間を平均3日から平均4時間（95%短縮）へ。" }
        ],
        resultTitle: "推進の成果と、目指す未来",
        result: "小さな改善の積み重ねにより、年間約3,200時間の業務削減と、約1,000万円相当の投資対効果（約6倍以上）を生み出しました。最大の成果は時間削減以上に、「自分たちで作れる」「もっと良い方法があるはず」という職員の心の変化です。",
        roadmap: [
          { when: "現在", title: "基盤構築", text: "業務の自動化、ペーパーレス化、スキルの底上げ。" },
          { when: "3年後", title: "データ活用", text: "ルーチンワークの80%自動化、AIによる予測、データに基づく意思決定。" },
          { when: "5年後", title: "業界リーダー", text: "新たな価値の創出と、生協として社会課題の解決へ貢献。" }
        ]
      },
      teams: [
        {
          id: "alpha",
          code: "ALPHA",
          name: "Alpha隊",
          app: "GAZN（画ゾーン）",
          theme: "写真の一元管理",
          summary: "キーワードで瞬時に探せるフォトライブラリーを構築し、画像検索の時間を数十分から数秒へ短縮しました。",
          members: [
            { name: "藤永郁子", role: "リーダー" },
            { name: "関根一成" },
            { name: "金谷慎太郎" },
            { name: "原聡子" },
            { name: "塚本誠" }
          ],
          media: [
            { type: "slides", title: "プレゼン資料", url: "https://drive.google.com/file/d/1-K5xAyQ-fuO6QbBzVlZPWp5uVsSvcXgu/view" },
            { type: "video", title: "発表動画", url: "https://drive.google.com/file/d/1jkCW1H4K7w7lG4dThJHtJR9HO8uCDzLm/view" }
          ]
        },
        {
          id: "bravo",
          code: "BRAVO",
          name: "Bravo隊",
          app: "Quest（クエスト）",
          theme: "タスク管理アプリ",
          summary: "共有ToDoで依頼と進捗を可視化し、未完了者への自動通知でタスク漏れを防ぎます。",
          members: [
            { name: "中島健太郎", role: "リーダー" },
            { name: "杉山匡邦" },
            { name: "横塚雅美" },
            { name: "高橋知史" },
            { name: "小林遥" }
          ],
          media: [
            { type: "slides", title: "プレゼン資料", url: "https://docs.google.com/presentation/d/1bjDJ1OvAnkMyoFDSn1REtdaVbhcHM3C-sEHTlU54kPw/present" },
            { type: "video", title: "発表動画", url: "https://drive.google.com/file/d/1peOlnDlnZtIIrgkokvO68kgGDjBYJiBQ/view" }
          ]
        },
        {
          id: "charlie",
          code: "CHARLIE",
          name: "Charlie隊",
          app: "どられぽ",
          theme: "運転月報のデジタル管理",
          summary: "紙ベースだった運転月報をデジタル化し、月末の締め作業とデータに基づく安全管理を実現しました。",
          members: [
            { name: "下山拓也", role: "リーダー" },
            { name: "六角薫" },
            { name: "堀内謙一" },
            { name: "山田大輔" },
            { name: "榎本雄太" }
          ],
          media: [
            { type: "slides", title: "プレゼン資料", url: "https://drive.google.com/file/d/1C6AKtMy6XJ8c-Sd1W-89tnHSsMDrcdgu/view" },
            { type: "video", title: "発表動画", url: "https://drive.google.com/file/d/1iG7E-9ozRW1ZI4VE9KnfUq4XcyvwbxAw/view" }
          ]
        },
        {
          id: "delta",
          code: "DELTA",
          name: "Delta隊",
          app: "ケアパル",
          theme: "直行直帰ヘルパー活動報告",
          summary: "スマホ完結の報告システムで、移動距離や時間から交通費・給与計算の基礎データを自動生成します。",
          members: [
            { name: "松本大輔", role: "リーダー" },
            { name: "西田哲紀子" },
            { name: "青木済美" },
            { name: "瀧澤優作" },
            { name: "庭野優樹" },
            { name: "髙坂雄士" }
          ],
          media: [
            { type: "slides", title: "プレゼン資料", url: "https://drive.google.com/file/d/1WAdbIaz6ulPuaWbIaomqTAtOYO-jPBHu/view" },
            { type: "video", title: "発表動画", url: "https://drive.google.com/file/d/1f0IZUC_1tx-0pDr58DV4GfSVANnEAYGp/view" }
          ]
        }
      ]
    },
    "2026h1": {
      id: "2026h1",
      href: "2026h1/index.html",
      label: "2026年度 上期",
      seasonNo: 2,
      status: "published",
      statusLabel: "Season 02 / 公開中",
      period: "2026年4月 — 2026年9月",
      eventDate: "",
      eventTitle: "第2回 DX推進タスク 成果発表会",
      accent: "violet",
      lead: "2シーズン目。Venus隊の受付センター向けCRMと、Jupiter隊の持ち出し備品管理アプリ。成果発表会の動画と、キックオフ時の網野専務あいさつ、各隊の資料を公開しています。",
      overview: {
        title: "",
        slidesUrl: ""
      },
      media: [
        { type: "video", title: "2026年 成果発表会", url: "https://drive.google.com/file/d/1QMm8MqRbpqcNjwy4rinz7sHMcLaUNT_v/view?usp=drive_link" },
        { type: "video", title: "2026キックオフ　網野専務 冒頭あいさつ", url: "https://drive.google.com/file/d/1rPQR2fLTrHc_QoxJ3WA2ywMZr1R7oe-J/view?usp=drive_link" }
      ],
      story: null,
      teams: [
        {
          id: "venus",
          code: "VENUS",
          name: "Venus隊",
          app: "Passtel（パステル）",
          theme: "受付センター特化CRMアプリ",
          summary: "受付センターの業務に特化したCRMで、組合員対応の記録と引き継ぎをスムーズにします。",
          members: [
            { name: "神田賢一", affiliation: "横浜南センター" },
            { name: "中尾景子", affiliation: "大和センター" },
            { name: "山中一誠", affiliation: "麻生センター" },
            { name: "赤峰ひかり", affiliation: "横浜北センター" },
            { name: "加藤結香", affiliation: "組織運営課" },
            { name: "木下沙季", affiliation: "営業推進課" },
            { name: "遠藤爽華", affiliation: "横浜菅田センター" }
          ],
          media: [
            { type: "slides", title: "プレゼン資料", url: "https://drive.google.com/file/d/1CE5BGF81y3tF1eEyFTnKQxHCR3cQv0QI/view?usp=drive_link" }
          ]
        },
        {
          id: "jupiter",
          code: "JUPITER",
          name: "Jupiter隊",
          app: "Mochi-Go（モチゴー）",
          theme: "現場使用持ち出し備品特化型備品管理アプリ",
          summary: "現場で使う持ち出し備品に特化し、所在と貸出状況を見える化します。",
          members: [
            { name: "依田靖", affiliation: "横浜中センター" },
            { name: "鈴木一哉", affiliation: "平塚センター" },
            { name: "牛塚聖", affiliation: "宮前センター" },
            { name: "堀添貴広", affiliation: "鶴見センター" },
            { name: "小林敏", affiliation: "人事課" },
            { name: "井桁圭子", affiliation: "広報課" }
          ],
          media: [
            { type: "slides", title: "プレゼン資料", url: "https://drive.google.com/file/d/1DFdsQPcw82hgJNofUnaGIdIGq0-mNYWi/view?usp=drive_link" }
          ]
        }
      ]
    }
  }
};

/**
 * 新しいチームを追加するときのひな型です。
 * seasons["2026h1"].teams にコピーして、名前と url を書き換えてください。
 *
 * 例:
 *   window.DX_TASK_DATA.seasons["2026h1"].teams.push({ ...template, id: "echo", ... });
 */
window.DX_TEAM_TEMPLATE = {
  id: "echo",
  code: "ECHO",
  name: "Echo隊",
  app: "アプリ名",
  theme: "テーマ（課題）",
  summary: "チームの取り組みを1〜2文で。",
  members: [
    { name: "氏名", role: "リーダー", affiliation: "所属" },
    { name: "氏名", affiliation: "所属" }
  ],
  media: [
    { type: "slides", title: "プレゼン資料", url: "" },
    { type: "video", title: "発表動画", url: "" }
  ]
};
