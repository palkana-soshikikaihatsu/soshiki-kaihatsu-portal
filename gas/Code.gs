/**
 * 組織開発課ポータル バックエンド
 *
 * 1. このファイルを Apps Script に貼る
 * 2. setup() を実行
 * 3. setInitialAdmin('ユーザー名', 'パスワード') を実行
 * 4. ウェブアプリとしてデプロイ（次のユーザーとして実行 / アクセス: 全員）
 * 5. 発行された /exec URL を assets/js/config.js の gasUrl に貼る
 */
const SESSION_HOURS = 12;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_FAIL = 8;

function doGet(e) {
  return handle_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  var data = {};
  if (e && e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = e.parameter || {};
    }
  } else if (e && e.parameter) {
    data = e.parameter;
  }
  return handle_(data);
}

function handle_(req) {
  var action = String(req.action || "ping");
  try {
    var result;
    switch (action) {
      case "ping":
        result = { ok: true, service: "od-portal" };
        break;
      case "login":
        result = login_(req.username, req.password);
        break;
      case "logout":
        result = logout_(req.token);
        break;
      case "listPosts":
        result = { ok: true, posts: listPosts_(false) };
        break;
      case "getPost":
        result = { ok: true, post: getPost_(req.id, req.token) };
        break;
      case "adminListPosts":
        requireAdmin_(req.token);
        result = { ok: true, posts: listPosts_(true) };
        break;
      case "createPost":
        result = { ok: true, post: upsertPost_(req.token, req.post || req, true) };
        break;
      case "updatePost":
        result = { ok: true, post: upsertPost_(req.token, req.post || req, false) };
        break;
      case "deletePost":
        requireAdmin_(req.token);
        result = deletePost_(req.id);
        break;
      case "uploadAttachment":
        result = { ok: true, attachment: uploadAttachment_(req) };
        break;
      case "deleteAttachment":
        requireAdmin_(req.token);
        result = deleteAttachment_(req.id);
        break;
      case "changePassword":
        result = changePassword_(req.token, req.currentPassword, req.newPassword);
        break;
      default:
        result = { ok: false, error: "未知のアクションです: " + action };
    }
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss;
  if (props.getProperty("SPREADSHEET_ID")) {
    ss = SpreadsheetApp.openById(props.getProperty("SPREADSHEET_ID"));
  } else {
    ss = SpreadsheetApp.create("組織開発課ポータル データ");
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }
  ensureSheet_(ss, "Admins", ["id", "username", "salt", "passwordHash", "createdAt", "lastLogin"]);
  ensureSheet_(ss, "Sessions", ["token", "username", "expiresAt", "createdAt"]);
  ensureSheet_(ss, "Posts", ["id", "title", "body", "category", "published", "author", "createdAt", "updatedAt"]);
  ensureSheet_(ss, "Attachments", ["id", "postId", "name", "mimeType", "size", "driveFileId", "createdAt"]);
  ensureSheet_(ss, "LoginLog", ["at", "username", "success", "note"]);

  var folder;
  if (props.getProperty("DRIVE_FOLDER_ID")) {
    folder = DriveApp.getFolderById(props.getProperty("DRIVE_FOLDER_ID"));
  } else {
    folder = DriveApp.createFolder("組織開発課ポータル 添付ファイル");
    props.setProperty("DRIVE_FOLDER_ID", folder.getId());
  }

  Logger.log("スプレッドシート: " + ss.getUrl());
  Logger.log("添付フォルダ: " + folder.getUrl());
  Logger.log("次に setInitialAdmin('admin', '任意の強いパスワード') を実行してください。");
}

function setInitialAdmin(username, password) {
  if (!username || !password) throw new Error("ユーザー名とパスワードを指定してください");
  setup();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sh_("Admins");
    var existing = findRow_(sheet, "username", String(username).trim());
    var cred = hashPassword_(password);
    var now = nowIso_();
    if (existing.index >= 0) {
      sheet.getRange(existing.index + 1, 3, 1, 2).setValues([[cred.salt, cred.hash]]);
    } else {
      sheet.appendRow([uid_(), String(username).trim(), cred.salt, cred.hash, now, ""]);
    }
  } finally {
    lock.releaseLock();
  }
  Logger.log("管理者を設定しました: " + username);
}

function login_(username, password) {
  username = String(username || "").trim();
  password = String(password || "");
  if (!username || !password) throw new Error("ユーザー名とパスワードを入力してください");
  if (tooManyFails_(username)) {
    throw new Error("失敗が続いたため、しばらく時間をおいてから再試行してください");
  }
  var row = findRow_(sh_("Admins"), "username", username);
  if (row.index < 0 || !checkPassword_(password, row.obj.salt, row.obj.passwordHash)) {
    logLogin_(username, false, "invalid");
    throw new Error("ユーザー名またはパスワードが違います");
  }
  var token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, "");
  var expires = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);
  sh_("Sessions").appendRow([token, username, expires.toISOString(), nowIso_()]);
  sh_("Admins").getRange(row.index + 1, 6).setValue(nowIso_());
  logLogin_(username, true, "ok");
  return { ok: true, token: token, username: username, expiresAt: expires.toISOString() };
}

function logout_(token) {
  if (!token) return { ok: true };
  var sheet = sh_("Sessions");
  var row = findRow_(sheet, "token", token);
  if (row.index >= 0) sheet.deleteRow(row.index + 1);
  return { ok: true };
}

function requireAdmin_(token) {
  var session = getSession_(token);
  if (!session) throw new Error("認証が必要です。再度ログインしてください");
  return session;
}

function getSession_(token) {
  if (!token) return null;
  var row = findRow_(sh_("Sessions"), "token", token);
  if (row.index < 0) return null;
  var exp = new Date(row.obj.expiresAt);
  if (Number.isNaN(exp.getTime()) || exp.getTime() < Date.now()) {
    sh_("Sessions").deleteRow(row.index + 1);
    return null;
  }
  return row.obj;
}

function listPosts_(includeDrafts) {
  var posts = objects_(sh_("Posts"));
  var atts = objects_(sh_("Attachments"));
  posts = posts.map(function (p) {
    p.published = toBool_(p.published);
    p.attachments = atts.filter(function (a) { return a.postId === p.id; }).map(publicAtt_);
    return p;
  });
  if (!includeDrafts) posts = posts.filter(function (p) { return p.published; });
  posts.sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
  return posts;
}

function getPost_(id, token) {
  if (!id) throw new Error("記事IDがありません");
  var row = findRow_(sh_("Posts"), "id", id);
  if (row.index < 0) throw new Error("記事が見つかりません");
  var post = row.obj;
  post.published = toBool_(post.published);
  if (!post.published) requireAdmin_(token);
  post.attachments = objects_(sh_("Attachments"))
    .filter(function (a) { return a.postId === id; })
    .map(publicAtt_);
  return post;
}

function upsertPost_(token, post, creating) {
  var session = requireAdmin_(token);
  post = post || {};
  var title = String(post.title || "").trim();
  if (!title) throw new Error("タイトルを入力してください");
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sh_("Posts");
    var now = nowIso_();
    if (creating || !post.id) {
      var id = uid_();
      sheet.appendRow([
        id, title, String(post.body || ""), String(post.category || "お知らせ"),
        !!post.published, session.username, now, now
      ]);
      return getPost_(id, token);
    }
    var row = findRow_(sheet, "id", post.id);
    if (row.index < 0) throw new Error("記事が見つかりません");
    sheet.getRange(row.index + 1, 2, 1, 7).setValues([[
      title, String(post.body || ""), String(post.category || "お知らせ"),
      !!post.published, row.obj.author || session.username, row.obj.createdAt, now
    ]]);
    return getPost_(post.id, token);
  } finally {
    lock.releaseLock();
  }
}

function deletePost_(id) {
  if (!id) throw new Error("記事IDがありません");
  var posts = sh_("Posts");
  var row = findRow_(posts, "id", id);
  if (row.index < 0) throw new Error("記事が見つかりません");
  var atts = objects_(sh_("Attachments")).filter(function (a) { return a.postId === id; });
  atts.forEach(function (a) { deleteAttachment_(a.id); });
  posts.deleteRow(row.index + 1);
  return { ok: true };
}

function uploadAttachment_(req) {
  requireAdmin_(req.token);
  if (!req.postId) throw new Error("投稿IDがありません");
  if (findRow_(sh_("Posts"), "id", req.postId).index < 0) throw new Error("記事が見つかりません");
  var name = String(req.name || "file");
  var mimeType = String(req.mimeType || "application/octet-stream");
  var data = String(req.data || "");
  if (!data) throw new Error("ファイルデータがありません");
  var bytes = Utilities.base64Decode(data);
  if (bytes.length > MAX_FILE_BYTES) throw new Error("ファイルサイズが上限を超えています");
  var folder = DriveApp.getFolderById(props_().getProperty("DRIVE_FOLDER_ID"));
  var blob = Utilities.newBlob(bytes, mimeType, name);
  var file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    Logger.log("公開設定に失敗: " + err);
  }
  var id = uid_();
  sh_("Attachments").appendRow([id, req.postId, name, mimeType, bytes.length, file.getId(), nowIso_()]);
  return publicAtt_({
    id: id, postId: req.postId, name: name, mimeType: mimeType,
    size: bytes.length, driveFileId: file.getId()
  });
}

function deleteAttachment_(id) {
  var sheet = sh_("Attachments");
  var row = findRow_(sheet, "id", id);
  if (row.index < 0) return { ok: true };
  try {
    DriveApp.getFileById(row.obj.driveFileId).setTrashed(true);
  } catch (err) {
    Logger.log("Drive削除スキップ: " + err);
  }
  sheet.deleteRow(row.index + 1);
  return { ok: true };
}

function changePassword_(token, currentPassword, newPassword) {
  var session = requireAdmin_(token);
  if (!newPassword || String(newPassword).length < 8) throw new Error("新しいパスワードは8文字以上にしてください");
  var row = findRow_(sh_("Admins"), "username", session.username);
  if (!checkPassword_(currentPassword, row.obj.salt, row.obj.passwordHash)) {
    throw new Error("現在のパスワードが違います");
  }
  var cred = hashPassword_(newPassword);
  sh_("Admins").getRange(row.index + 1, 3, 1, 2).setValues([[cred.salt, cred.hash]]);
  return { ok: true };
}

function publicAtt_(a) {
  return {
    id: a.id,
    postId: a.postId,
    name: a.name,
    mimeType: a.mimeType,
    size: a.size,
    driveFileId: a.driveFileId,
    url: (String(a.mimeType || "").indexOf("image/") === 0)
      ? "https://lh3.googleusercontent.com/d/" + a.driveFileId
      : "https://drive.google.com/uc?export=download&id=" + a.driveFileId
  };
}

function hashPassword_(password) {
  var salt = Utilities.getUuid();
  return { salt: salt, hash: digest_(salt + password) };
}

function checkPassword_(password, salt, hash) {
  return digest_(String(salt) + String(password)) === String(hash);
}

function digest_(text) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return raw.map(function (b) {
    var v = b < 0 ? b + 256 : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function tooManyFails_(username) {
  var rows = objects_(sh_("LoginLog"));
  var since = Date.now() - LOGIN_WINDOW_MS;
  var fails = rows.filter(function (r) {
    return r.username === username && String(r.success) !== "true" && new Date(r.at).getTime() >= since;
  });
  return fails.length >= LOGIN_MAX_FAIL;
}

function logLogin_(username, success, note) {
  sh_("LoginLog").appendRow([nowIso_(), username, success, note || ""]);
}

function props_() {
  return PropertiesService.getScriptProperties();
}

function ss_() {
  var id = props_().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("setup() が未実行です");
  return SpreadsheetApp.openById(id);
}

function sh_(name) {
  var sheet = ss_().getSheetByName(name);
  if (!sheet) throw new Error("シートがありません: " + name + "。setup() を実行してください");
  return sheet;
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var empty = existing.every(function (v) { return v === ""; });
  if (empty) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var def = ss.getSheetByName("シート1");
  if (def && ss.getSheets().length > 1 && def.getLastRow() <= 1) {
    try { ss.deleteSheet(def); } catch (e) {}
  }
}

function objects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  }).filter(function (o) { return o.id || o.token || o.at; });
}

function findRow_(sheet, key, value) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return { index: -1, obj: null };
  var headers = values[0];
  var ki = headers.indexOf(key);
  if (ki < 0) return { index: -1, obj: null };
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][ki]) === String(value)) {
      var obj = {};
      headers.forEach(function (h, j) { obj[h] = values[i][j]; });
      return { index: i, obj: obj };
    }
  }
  return { index: -1, obj: null };
}

function toBool_(v) {
  return v === true || v === "TRUE" || v === "true" || v === 1 || v === "1";
}

function nowIso_() {
  return new Date().toISOString();
}

function uid_() {
  return Utilities.getUuid();
}

/**
 * 初回だけ使う。PASSWORD を書き換えて実行し、終わったらパスワードを消すか関数を無効化すること。
 */
function bootstrapAdmin() {
  var USERNAME = "admin";
  var PASSWORD = "CHANGEME";
  if (PASSWORD === "CHANGEME") {
    throw new Error("PASSWORD を実際のパスワードに書き換えてから実行してください");
  }
  setInitialAdmin(USERNAME, PASSWORD);
}
