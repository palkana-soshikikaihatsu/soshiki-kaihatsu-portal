# 組織開発課ポータル

パルシステム神奈川 人事部 組織開発課のポータルサイトです。GitHub Pages で公開し、お知らせ（ブログ）の保存と管理者ログインは Google Apps Script + スプレッドシートで動かします。

## できること

- 組織開発課の紹介、PSP、進行中プロジェクト
- [いいね！パルプロジェクト](https://palkana-soshikikaihatsu.github.io/soshikikaihatsu.github.io/) へのリンク
- DX推進特設ページ（会議資料をもとに新規作成）
- 男女共同参画特設ページ（基本方針、メンター制度、同乗メンター、多世代グループワーク）
- お知らせの公開（画像・PDF などの添付対応）
- 管理者ログインからの投稿・編集・削除

## 公開（GitHub Pages）

1. このリポジトリの Settings → Pages
2. Source を **GitHub Actions**（ワークフロー同梱）または **Deploy from a branch**（`main` / `/ (root)`）にする
3. 公開 URL 例: `https://（アカウント）.github.io/soshiki-kaihatsu-portal/`

## お知らせ機能の接続

手順は [gas/README.md](gas/README.md) を参照してください。接続前でもサイトは閲覧でき、お知らせはデモ記事が表示されます。

## ローカル確認

`index.html` をブラウザで開くか、リポジトリ直下で簡易サーバーを起動します。

```bash
python -m http.server 8080
```

資料 PDF は `assets/docs/` にあります。
