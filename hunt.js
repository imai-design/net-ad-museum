/* ===========================================================
   広告ハント — ロジック
   端末内(localStorage)で完結する「自分の図鑑」が主体。
   config.js に Supabase を設定すると「みんなの壁」が点灯する。
   絵文字は使わない（SVG・記号・レア度マークで表現）。
   =========================================================== */

const CFG = window.AD_HUNT_CONFIG || {};
const WALL_ON = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

const KEY = "adhunt.catches.v1";
const TIERS = ["N", "R", "SR", "UR"];
const TIER_LABEL = { N: "ノーマル", R: "レア", SR: "スーパーレア", UR: "ウルトラレア" };
const XP_BY = { N: 10, R: 25, SR: 50, UR: 100 };
const HOLO_BONUS = 15;
const MAX_CATCHES = 80;

const GENRES = [
  { key: "street",  label: "屋外・ビルボード",     base: "SR" },
  { key: "train",   label: "電車・駅",            base: "R"  },
  { key: "store",   label: "店頭・POP",           base: "N"  },
  { key: "digital", label: "デジタルサイネージ",   base: "R"  },
  { key: "web",     label: "Web・アプリ",         base: "N"  },
  { key: "special", label: "特殊・期間限定",       base: "UR" },
  { key: "other",   label: "その他",             base: "N"  },
];
const genreLabel = k => (GENRES.find(g => g.key === k) || {}).label || "その他";

/* ---------- SVGアイコン ---------- */
const SVG = {
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>',
  cam:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  img:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  x:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  share:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  star:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
  flag:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9a6 6 0 0 0 12 0V3H6z"/><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 21h6M12 17v4"/></svg>',
  fire:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 11 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12z"/></svg>',
  moon:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  grid:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
};

/* ---------- データ層（localStorage） ---------- */
function loadCatches() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function persist(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); return true; }
  catch { return false; }
}

/* ---------- 画像圧縮 ---------- */
function compressToDataURL(srcImgOrCanvas, maxDim = 900, quality = 0.72) {
  const w = srcImgOrCanvas.videoWidth || srcImgOrCanvas.naturalWidth || srcImgOrCanvas.width;
  const h = srcImgOrCanvas.videoHeight || srcImgOrCanvas.naturalHeight || srcImgOrCanvas.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const cw = Math.round(w * scale), ch = Math.round(h * scale);
  const cv = document.createElement("canvas");
  cv.width = cw; cv.height = ch;
  cv.getContext("2d").drawImage(srcImgOrCanvas, 0, 0, cw, ch);
  return cv.toDataURL("image/jpeg", quality);
}
function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(compressToDataURL(img));
    img.onerror = rej;
    const r = new FileReader();
    r.onload = e => { img.src = e.target.result; };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ---------- レア度 ---------- */
function rollRarity(genreKey) {
  const g = GENRES.find(x => x.key === genreKey) || GENRES[GENRES.length - 1];
  let idx = TIERS.indexOf(g.base);
  let holo = Math.random() < 0.12;
  if (holo) idx = Math.min(idx + 1, TIERS.length - 1);
  return { rarity: TIERS[idx], holo };
}

/* ---------- プロフィール算出 ---------- */
function computeProfile(catches) {
  let xp = 0;
  const brands = new Set(), genres = new Set(), days = new Set();
  let hasUR = false, hasSRplus = false, hasHolo = false, hasNight = false;
  catches.forEach(c => {
    xp += (XP_BY[c.rarity] || 10) + (c.holo ? HOLO_BONUS : 0);
    if (c.brand) brands.add(c.brand.trim().toLowerCase());
    genres.add(c.genre);
    days.add(new Date(c.ts).toDateString());
    if (c.rarity === "UR") hasUR = true;
    if (c.rarity === "SR" || c.rarity === "UR") hasSRplus = true;
    if (c.holo) hasHolo = true;
    const hr = new Date(c.ts).getHours();
    if (hr >= 20 || hr < 5) hasNight = true;
  });
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpThis = (level - 1) ** 2 * 50;
  const xpNext = level ** 2 * 50;
  const streak = computeStreak(days);
  return {
    xp, level, xpThis, xpNext, streak,
    count: catches.length, kinds: brands.size, genreCount: genres.size,
    hasUR, hasSRplus, hasHolo, hasNight,
  };
}
function computeStreak(daySet) {
  if (!daySet.size) return 0;
  const set = new Set([...daySet].map(d => new Date(d).setHours(0, 0, 0, 0)));
  const DAY = 86400000;
  let t = new Date().setHours(0, 0, 0, 0);
  if (!set.has(t)) t -= DAY;            // 今日まだなら昨日から数える
  let s = 0;
  while (set.has(t)) { s++; t -= DAY; }
  return s;
}

/* ---------- バッジ定義 ---------- */
const BADGES = [
  { id: "first",   t: "初キャプチャ",     d: "最初の1枚", ic: SVG.target, ok: p => p.count >= 1 },
  { id: "ten",     t: "10キャプチャ",     d: "10枚集めた", ic: SVG.grid,   ok: p => p.count >= 10 },
  { id: "kinds5",  t: "5ブランド",        d: "5種類の広告主", ic: SVG.flag, ok: p => p.kinds >= 5 },
  { id: "allgen",  t: "ジャンル制覇",     d: "6ジャンル網羅", ic: SVG.trophy, ok: p => p.genreCount >= 6 },
  { id: "rare",    t: "レアハンター",     d: "SR以上を捕獲", ic: SVG.star, ok: p => p.hasSRplus },
  { id: "ultra",   t: "伝説の一枚",       d: "URを捕獲", ic: SVG.trophy, ok: p => p.hasUR },
  { id: "holo",    t: "キラ獲得",         d: "ホロ版を捕獲", ic: SVG.star, ok: p => p.hasHolo },
  { id: "streak3", t: "3日連続",          d: "3日続けてハント", ic: SVG.fire, ok: p => p.streak >= 3 },
  { id: "night",   t: "夜のハンター",     d: "夜に捕獲", ic: SVG.moon, ok: p => p.hasNight },
];

/* ===========================================================
   状態
   =========================================================== */
let catches = loadCatches();
let dexFilter = "all";
let pendingPhoto = null;   // 撮影/選択した圧縮済みdataURL
let pendingGenre = null;
let pendingLoc = { lat: null, lng: null };
let camStream = null;
let map = null, markerLayer = null;

/* ===========================================================
   描画
   =========================================================== */
function $(id) { return document.getElementById(id); }

function renderHUD() {
  const p = computeProfile(catches);
  $("lvVal").textContent = p.level;
  const pct = Math.max(0, Math.min(100, ((p.xp - p.xpThis) / (p.xpNext - p.xpThis)) * 100));
  $("xpFill").style.width = pct + "%";
  $("xpTxt").textContent = `XP ${p.xp} ／ 次のレベルまで ${Math.max(0, p.xpNext - p.xp)}`;
  $("stCount").textContent = p.count;
  $("stKinds").textContent = p.kinds;
  $("stStreak").textContent = p.streak;
}

function renderDex() {
  const wrap = $("dex");
  let list = [...catches].sort((a, b) => b.ts - a.ts);
  if (dexFilter !== "all") list = list.filter(c => (dexFilter.length <= 2 ? c.rarity === dexFilter : c.genre === dexFilter));
  $("dexCount").textContent = `${catches.length} 捕獲`;

  if (!list.length) {
    wrap.innerHTML = `<div class="dex-empty"><b>まだ図鑑は空です</b>街で見かけた広告を「捕まえる」と、ここに集まります。ポスター・電車内・看板・サイネージ、なんでも。</div>`;
    return;
  }
  wrap.innerHTML = list.map(c => `
    <article class="card ${c.holo ? "is-holo" : ""}" data-id="${c.id}" tabindex="0">
      <span class="card__rarity r-${c.rarity}">${c.rarity}${c.holo ? " キラ" : ""}</span>
      <img class="card__img" src="${c.img}" alt="${escapeHtml(c.brand || "広告")}" loading="lazy">
      <div class="card__body">
        <div class="card__brand">${escapeHtml(c.brand || "名もなき広告")}</div>
        <div class="card__meta">${genreLabel(c.genre)}${c.place ? " ・ " + escapeHtml(c.place) : ""}</div>
      </div>
    </article>`).join("");
  wrap.querySelectorAll(".card").forEach(el => {
    const open = () => openDetail(el.dataset.id);
    el.addEventListener("click", open);
    el.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
}

function renderDexFilters() {
  const items = [["all", "すべて"], ...TIERS.map(t => [t, t]), ...GENRES.map(g => [g.key, g.label])];
  $("dexFilters").innerHTML = items.map(([k, l], i) =>
    `<button class="chip ${i === 0 ? "is-active" : ""}" data-f="${k}">${l}</button>`).join("");
  $("dexFilters").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    $("dexFilters").querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
    b.classList.add("is-active");
    dexFilter = b.dataset.f; renderDex();
  });
}

function renderBadges() {
  const p = computeProfile(catches);
  $("badges").innerHTML = BADGES.map(b => {
    const got = b.ok(p);
    return `<div class="bdg ${got ? "" : "is-locked"}">
      <span class="bdg__ic">${b.ic}</span>
      <span><span class="bdg__t">${b.t}</span><br><span class="bdg__d">${b.d}</span></span>
    </div>`;
  }).join("");
}

/* ---------- 地図 ---------- */
function renderMap() {
  if (typeof L === "undefined") { $("map").innerHTML = '<div style="padding:24px;color:var(--ink-faint)">地図を読み込めませんでした（オフライン時など）。</div>'; return; }
  const pts = catches.filter(c => c.lat != null && c.lng != null);
  if (!map) {
    map = L.map("map", { scrollWheelZoom: false }).setView([35.681, 139.767], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
  }
  markerLayer.clearLayers();
  if (!pts.length) { $("mapNote").textContent = "位置情報つきの捕獲がまだありません。捕獲時に「現在地をつける」を押すと、ここに地図でたまります。"; return; }
  $("mapNote").textContent = `${pts.length} 件を地図に表示中。`;
  const group = [];
  pts.forEach(c => {
    const m = L.marker([c.lat, c.lng]).bindPopup(`<b>${escapeHtml(c.brand || "広告")}</b><br>${genreLabel(c.genre)} ・ ${c.rarity}`);
    markerLayer.addLayer(m); group.push([c.lat, c.lng]);
  });
  if (group.length) map.fitBounds(group, { padding: [40, 40], maxZoom: 14 });
}

/* ===========================================================
   捕獲フロー
   =========================================================== */
function openCapture() {
  resetCaptureSheet();
  $("captureDlg").showModal();
}
function resetCaptureSheet() {
  stopCamera();
  pendingPhoto = null; pendingGenre = null; pendingLoc = { lat: null, lng: null };
  $("shotPreview").style.display = "none";
  $("camVideo").style.display = "none";
  $("shutterBtn").style.display = "none";
  $("shotHint").style.display = "flex";
  $("brandInput").value = ""; $("placeInput").value = ""; $("capInput").value = "";
  $("locText").textContent = "位置情報なし";
  $("genreWrap").querySelectorAll(".genre").forEach(g => g.classList.remove("is-active"));
  updateSaveState();
}
function updateSaveState() {
  $("saveCatchBtn").disabled = !(pendingPhoto && pendingGenre);
}

async function startCamera() {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    const v = $("camVideo");
    v.srcObject = camStream; await v.play();
    $("shotHint").style.display = "none";
    $("shotPreview").style.display = "none";
    v.style.display = "block";
    $("shutterBtn").style.display = "inline-flex";
  } catch (e) {
    alert("カメラを起動できませんでした。『写真を選ぶ／撮る』から画像を選んでください。");
  }
}
function stopCamera() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  const v = $("camVideo"); if (v) { v.style.display = "none"; v.srcObject = null; }
  const sb = $("shutterBtn"); if (sb) sb.style.display = "none";
}
function shoot() {
  const v = $("camVideo");
  pendingPhoto = compressToDataURL(v);
  stopCamera();
  showPreview();
}
async function pickFile(file) {
  if (!file) return;
  pendingPhoto = await fileToDataURL(file);
  stopCamera();
  showPreview();
}
function showPreview() {
  const img = $("shotPreview");
  img.src = pendingPhoto; img.style.display = "block";
  $("shotHint").style.display = "none";
  updateSaveState();
}

function useLocation() {
  if (!navigator.geolocation) { alert("この端末では位置情報が使えません。"); return; }
  $("locText").textContent = "取得中…";
  navigator.geolocation.getCurrentPosition(
    pos => {
      pendingLoc = { lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) };
      $("locText").textContent = `現在地を記録（${pendingLoc.lat}, ${pendingLoc.lng}）`;
    },
    () => { $("locText").textContent = "位置情報を取得できませんでした"; },
    { enableHighAccuracy: false, timeout: 8000 }
  );
}

function saveCatch() {
  if (!pendingPhoto || !pendingGenre) return;
  if (catches.length >= MAX_CATCHES) {
    alert(`図鑑の上限（${MAX_CATCHES}枚）です。古い捕獲をいくつか消すと追加できます。`);
    return;
  }
  const { rarity, holo } = rollRarity(pendingGenre);
  const c = {
    id: "c" + Date.now() + Math.floor(Math.random() * 1000),
    brand: $("brandInput").value.trim(),
    genre: pendingGenre,
    place: $("placeInput").value.trim(),
    caption: $("capInput").value.trim(),
    rarity, holo,
    img: pendingPhoto,
    lat: pendingLoc.lat, lng: pendingLoc.lng,
    ts: Date.now(),
  };
  const next = [c, ...catches];
  if (!persist(next)) {
    alert("端末の保存容量がいっぱいで登録できませんでした。古い捕獲を消してから再度お試しください。");
    return;
  }
  catches = next;
  $("captureDlg").close();
  renderAll();
  showGet(c);
}

/* ---------- GET 演出 ---------- */
function showGet(c) {
  const xp = (XP_BY[c.rarity] || 10) + (c.holo ? HOLO_BONUS : 0);
  $("getRaysImg").src = c.img;
  const tag = $("getTag"); tag.className = "get-tag r-" + c.rarity;
  tag.textContent = `${c.rarity} ${TIER_LABEL[c.rarity]}${c.holo ? " ・ キラ" : ""}`;
  $("getTitle").textContent = "GET!";
  $("getSub").textContent = (c.brand || "名もなき広告") + " を図鑑に登録しました";
  $("getXp").textContent = `+${xp} XP`;
  $("getRays").classList.remove("pop-in"); void $("getRays").offsetWidth; $("getRays").classList.add("pop-in");
  $("getDlg").showModal();
  $("getShare").onclick = () => shareCard(c);
}

/* ---------- 詳細 ---------- */
function openDetail(id) {
  const c = catches.find(x => x.id === id); if (!c) return;
  $("detailImg").src = c.img;
  $("detailBrand").textContent = c.brand || "名もなき広告";
  $("detailMeta").innerHTML = `<span class="r-${c.rarity}" style="padding:2px 7px;border-radius:5px">${c.rarity} ${TIER_LABEL[c.rarity]}${c.holo ? " ・ キラ" : ""}</span> ／ ${genreLabel(c.genre)}${c.place ? " ／ " + escapeHtml(c.place) : ""} ／ ${new Date(c.ts).toLocaleDateString("ja-JP")}`;
  $("detailCap").textContent = c.caption || "";
  $("detailShare").onclick = () => shareCard(c);
  $("detailDelete").onclick = () => {
    if (confirm("この捕獲を図鑑から削除しますか？")) {
      catches = catches.filter(x => x.id !== id); persist(catches);
      $("detailDlg").close(); renderAll();
    }
  };
  const wallBtn = $("detailWall");
  if (WALL_ON) { wallBtn.style.display = ""; wallBtn.onclick = () => postToWall(c, wallBtn); }
  else wallBtn.style.display = "none";
  $("detailDlg").showModal();
}

/* ---------- シェアカード（canvas → 保存／共有） ---------- */
function shareCard(c) {
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  x.fillStyle = "#0d0d0f"; x.fillRect(0, 0, W, H);

  const img = new Image();
  img.onload = () => {
    // 写真をカバー配置（中央）
    const area = { x: 70, y: 150, w: W - 140, h: 760 };
    const s = Math.max(area.w / img.width, area.h / img.height);
    const dw = img.width * s, dh = img.height * s;
    x.save();
    x.beginPath(); roundRect(x, area.x, area.y, area.w, area.h, 18); x.clip();
    x.drawImage(img, area.x + (area.w - dw) / 2, area.y + (area.h - dh) / 2, dw, dh);
    x.restore();
    // 金枠
    x.strokeStyle = "#c8a96a"; x.lineWidth = 4;
    roundRect(x, area.x, area.y, area.w, area.h, 18); x.stroke();

    // レア度タグ
    const rc = { N: "#8a8f98", R: "#5aa9e6", SR: "#b07bdc", UR: "#e8b94a" }[c.rarity];
    x.fillStyle = "rgba(0,0,0,.65)"; roundRect(x, area.x + 18, area.y + 18, 220, 56, 10); x.fill();
    x.fillStyle = rc; x.font = "bold 30px 'Noto Sans JP', sans-serif";
    x.fillText(`${c.rarity}  ${TIER_LABEL[c.rarity]}${c.holo ? " キラ" : ""}`, area.x + 36, area.y + 56);

    // ヘッダー
    x.fillStyle = "#c8a96a"; x.font = "500 30px 'Noto Serif JP', serif";
    x.fillText("AD HUNT  ・  広告ハント", 70, 100);

    // ブランド
    x.fillStyle = "#ece9e3"; x.font = "bold 54px 'Noto Serif JP', serif";
    wrapText(x, c.brand || "名もなき広告", 70, 1000, W - 140, 62, 1);

    // メタ
    x.fillStyle = "#a7a39b"; x.font = "28px 'Noto Sans JP', sans-serif";
    x.fillText(`${genreLabel(c.genre)}${c.place ? " ・ " + c.place : ""}`, 70, 1058);
    x.fillText(new Date(c.ts).toLocaleDateString("ja-JP"), 70, 1098);

    // キャプション
    if (c.caption) { x.fillStyle = "#ece9e3"; x.font = "30px 'Noto Sans JP', sans-serif"; wrapText(x, "「" + c.caption + "」", 70, 1160, W - 140, 42, 2); }

    // フッター
    x.fillStyle = "#6f6c66"; x.font = "24px 'Noto Sans JP', sans-serif";
    x.fillText("ネット広告博物館  imai-design.github.io/net-ad-museum", 70, H - 50);

    cv.toBlob(blob => deliverShare(blob, c), "image/png");
  };
  img.src = c.img;
}
function deliverShare(blob, c) {
  const file = new File([blob], "ad-hunt.png", { type: "image/png" });
  const text = `広告ハントで「${c.brand || "広告"}」を捕まえた（${c.rarity}）`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], text, title: "広告ハント" }).catch(() => {});
  } else {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "ad-hunt.png"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
}
function roundRect(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function wrapText(x, text, X, Y, maxW, lh, maxLines) {
  const words = [...text]; let line = "", lines = [];
  for (const ch of words) { if (x.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; } else line += ch; }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => x.fillText(l, X, Y + i * lh));
}

/* ===========================================================
   みんなの壁（Supabase・任意）
   =========================================================== */
function sbHeaders(extra) {
  return Object.assign({ apikey: CFG.supabaseAnonKey, Authorization: "Bearer " + CFG.supabaseAnonKey }, extra || {});
}
function dataURLtoBlob(dataURL) {
  const [head, b64] = dataURL.split(",");
  const mime = head.match(/:(.*?);/)[1];
  const bin = atob(b64); const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}
async function postToWall(c, btn) {
  if (!WALL_ON) return;
  btn.disabled = true; const orig = btn.textContent; btn.textContent = "投稿中…";
  try {
    const blob = dataURLtoBlob(c.img);
    const fname = `${Date.now()}-${Math.floor(Math.random() * 1e4)}.jpg`;
    const up = await fetch(`${CFG.supabaseUrl}/storage/v1/object/${CFG.bucket}/${fname}`, {
      method: "POST", headers: sbHeaders({ "Content-Type": "image/jpeg" }), body: blob,
    });
    if (!up.ok) throw new Error("upload");
    const publicUrl = `${CFG.supabaseUrl}/storage/v1/object/public/${CFG.bucket}/${fname}`;
    const ins = await fetch(`${CFG.supabaseUrl}/rest/v1/${CFG.table}`, {
      method: "POST", headers: sbHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify({ brand: c.brand, genre: c.genre, place: c.place, caption: c.caption, rarity: c.rarity, holo: c.holo, image_url: publicUrl }),
    });
    if (!ins.ok) throw new Error("insert");
    btn.textContent = "投稿しました";
    loadWall();
  } catch (e) {
    alert("みんなの壁に投稿できませんでした。設定（config.js / Supabase権限）をご確認ください。");
    btn.textContent = orig; btn.disabled = false;
  }
}
async function loadWall() {
  const wrap = $("wall"), state = $("wallState");
  if (!WALL_ON) {
    wrap.innerHTML = "";
    state.innerHTML = `<b>みんなの壁は準備中です。</b><br>いまは「自分の図鑑」に貯めて、シェアカードでSNSに投稿できます。運営が共有フィードを有効化すると、ここにみんなの捕獲が並びます。`;
    return;
  }
  state.textContent = "読み込み中…";
  try {
    const r = await fetch(`${CFG.supabaseUrl}/rest/v1/${CFG.table}?select=*&order=created_at.desc&limit=60`, { headers: sbHeaders() });
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) { state.textContent = "まだ投稿がありません。最初の一枚を投稿しよう。"; wrap.innerHTML = ""; return; }
    state.textContent = "";
    wrap.innerHTML = rows.map(c => `
      <article class="card ${c.holo ? "is-holo" : ""}">
        <span class="card__rarity r-${c.rarity || "N"}">${c.rarity || "N"}</span>
        <img class="card__img" src="${c.image_url}" alt="${escapeHtml(c.brand || "広告")}" loading="lazy">
        <div class="card__body">
          <div class="card__brand">${escapeHtml(c.brand || "名もなき広告")}</div>
          <div class="card__meta">${genreLabel(c.genre)}${c.place ? " ・ " + escapeHtml(c.place) : ""}</div>
        </div>
      </article>`).join("");
  } catch (e) {
    state.textContent = "みんなの壁を読み込めませんでした。";
  }
}

/* ===========================================================
   ユーティリティ・起動
   =========================================================== */
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])); }

function renderAll() { renderHUD(); renderDex(); renderBadges(); renderMap(); }

document.addEventListener("DOMContentLoaded", () => {
  // ジャンル選択
  $("genreWrap").innerHTML = GENRES.map(g => `<button type="button" class="genre" data-g="${g.key}">${g.label}</button>`).join("");
  $("genreWrap").addEventListener("click", e => {
    const b = e.target.closest(".genre"); if (!b) return;
    $("genreWrap").querySelectorAll(".genre").forEach(x => x.classList.remove("is-active"));
    b.classList.add("is-active"); pendingGenre = b.dataset.g; updateSaveState();
  });

  // 捕獲ボタン
  $("catchBtn").addEventListener("click", openCapture);
  $("catchFab").addEventListener("click", openCapture);

  // 撮影シート操作
  $("useCamera").addEventListener("click", startCamera);
  $("shutterBtn").addEventListener("click", shoot);
  $("fileInput").addEventListener("change", e => pickFile(e.target.files[0]));
  $("locBtn").addEventListener("click", useLocation);
  $("saveCatchBtn").addEventListener("click", saveCatch);
  $("captureClose").addEventListener("click", () => $("captureDlg").close());
  $("captureDlg").addEventListener("close", stopCamera);

  // GET / 詳細 閉じる
  $("getClose").addEventListener("click", () => $("getDlg").close());
  $("detailClose").addEventListener("click", () => $("detailDlg").close());

  renderDexFilters();
  renderAll();
  loadWall();
});
