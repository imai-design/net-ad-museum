/* ===========================================================
   ネット広告博物館  —  データ & 描画
   - 展示データは全て Web 検索で年・受賞・反響を裏取り済み
   - 確証のある公式動画は埋め込み、無いものは公式検索リンクに退避
   - アフィリエイトはまず Amazon を汎用軸に。講座/ツールは
     ASP発行後に AFFILIATE のURLを差し替えるだけで有効化
   - 絵文字は使わない（記号・SVG・連番で表現）
   =========================================================== */

/* ---------- アフィリエイト設定（ここだけ差し替えればよい） ---------- */
const AFFILIATE = {
  // Amazonアソシエイト タグ。あなたのトラッキングIDに差し替える（例 "ryoseiworld-22"）
  amazonTag: "ryoseiworld-22",
  // 講座・ツールのアフィリリンク。ASP（A8.net / もしも 等）で発行後に差し替える。
  // 空のままなら公式サイトへ通常リンクする（クリックは機能するが報酬は付かない）。
  links: {
    udemy:  "",   // 例: もしもアフィリエイト経由のUdemyリンク
    canva:  "",
    adobe:  "",
    capcut: "",
    filmora:"",
  },
  officialFallback: {
    udemy:  "https://www.udemy.com/courses/marketing/",
    canva:  "https://www.canva.com/ja_jp/",
    adobe:  "https://www.adobe.com/jp/express/",
    capcut: "https://www.capcut.com/ja-jp/",
    filmora:"https://filmora.wondershare.jp/",
  },
};

function amazonSearch(keyword) {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${encodeURIComponent(AFFILIATE.amazonTag)}`;
}
function toolLink(key) {
  return AFFILIATE.links[key] || AFFILIATE.officialFallback[key] || "#";
}

/* ---------- 展示データ（古い順 → 表示は新しい順に並べ替え） ---------- */
const EXHIBITS = [
  {
    id: "boss-jones",
    yearNum: 2006, year: "2006〜",
    brand: "サントリー BOSS",
    title: "宇宙人ジョーンズ「この惑星の住人は…」",
    cats: ["シリーズ", "Web/TV"],
    videoId: "NVXnlOlPzZA",
    searchQuery: "サントリー BOSS 宇宙人ジョーンズ 公式",
    summary: "地球を調査しにきた宇宙人（トミー・リー・ジョーンズ）が、人間に紛れてあらゆる職業を体験する缶コーヒーCM。働く人々への讃歌を、辛口のナレーションで描く。",
    why: "2006年から20年・100作近く続く日本屈指の長寿シリーズ。毎回ちがう職場を舞台に「働くすべての人へ」というブランドメッセージを更新し続けている。",
    learn: { kw: "ブランディング 広告 ロングセラー 書籍", label: "ロングセラー広告に学ぶ" },
  },
  {
    id: "uniqlock",
    yearNum: 2007, year: "2007〜",
    brand: "ユニクロ",
    title: "UNIQLOCK",
    cats: ["ブログパーツ", "インタラクティブ"],
    videoId: "",
    searchQuery: "UNIQLOCK ユニクロ",
    summary: "MUSIC × DANCE × CLOCK。踊る女性と音楽つきの「時計」をブログに貼れるブログパーツとして配布し、世界中のブログを巻き込んで拡散した。商品を売らずに世界観だけを配る発想。",
    why: "カンヌ国際広告祭でチタニウム部門・サイバー部門のダブルグランプリ、さらにCLIO・One Showも制覇し世界三大広告賞を総なめ。日本のデジタル広告史の金字塔。",
    learn: { kw: "Webマーケティング 沈黙のWebマーケティング", label: "Web施策の設計を学ぶ" },
  },
  {
    id: "softbank-shiroto",
    yearNum: 2007, year: "2007〜",
    brand: "ソフトバンク",
    title: "白戸家「お父さん犬」",
    cats: ["シリーズ", "Web/TV"],
    videoId: "",
    searchQuery: "ソフトバンク 白戸家 お父さん犬 CM",
    summary: "父が白い北海道犬（カイくん／声・北大路欣也）という奇抜な家族設定で料金プランを伝えるシリーズ。上戸彩・樋口可南子・ダンテ＝カーヴァーらが家族を演じた。",
    why: "「犬がお父さん」という一発のフックで携帯各社のCM戦争を制した代表例。初代カイくんの訃報（2018年）が全国ニュースになるほど国民的キャラクターに育った。",
    learn: { kw: "キャラクター マーケティング 広告 戦略 書籍", label: "キャラ訴求の戦略を学ぶ" },
  },
  {
    id: "docomo-xylophone",
    yearNum: 2011, year: "2011",
    brand: "NTTドコモ",
    title: "森の木琴（TOUCH WOOD SH-08C）",
    cats: ["バイラル動画"],
    videoId: "OsmG4bUHtFk",
    searchQuery: "NTTドコモ 森の木琴 TOUCH WOOD",
    summary: "山の斜面に組まれた全長44mの巨大な木琴を木のボールが転がり落ち、バッハ「主よ、人の望みの喜びよ」を一音ずつ奏でる。間伐材ケータイのための一本撮りWeb動画。",
    why: "カンヌをはじめ国内外20以上の賞を受賞し、YouTube再生1,500万回超。広告というより一篇の映像作品として世界に届いた、日本のクラフト×自然描写の到達点。",
    learn: { kw: "映像制作 演出 絵コンテ 書籍", label: "映像演出を学ぶ" },
  },
  {
    id: "pepsi-momotaro",
    yearNum: 2014, year: "2014〜2017",
    brand: "ペプシ（PEPSI NEX ZERO）",
    title: "桃太郎",
    cats: ["大作Web CM", "シリーズ"],
    videoId: "",
    searchQuery: "ペプシ 桃太郎 小栗旬 CM",
    summary: "小栗旬の桃太郎、ジュード・ロウ、野村周平らが豪華キャストで挑む実写映画さながらの連作。TVで断片を流し、続きと結末をWebで見せる「映画的CM」を年単位で展開した。",
    why: "2014年のACC CMフェスティバルでグランプリを受賞。1本のCMをシリーズ・長尺・Web誘導で“続きが気になる物語”に仕立て、テレビとネットの役割分担を象徴した。",
    learn: { kw: "ストーリーテリング 動画マーケティング 書籍", label: "物語型動画を学ぶ" },
  },
  {
    id: "au-santaro",
    yearNum: 2015, year: "2015〜",
    brand: "au（KDDI）",
    title: "三太郎シリーズ",
    cats: ["シリーズ", "Web/TV"],
    videoId: "oOxBHA9i-F4",
    searchQuery: "au 三太郎 CM 公式",
    summary: "桃太郎（松田翔太）・浦島太郎（桐谷健太）・金太郎（濱田岳）ら昔話の英雄が実は友だち、という設定の長期シリーズ。「あたらしい英雄、はじまるっ」で2015年に開始。",
    why: "毎回くすっと笑える日常劇で、世代を超えて愛されるブランドの“顔”を作り上げた。桐谷健太の歌「海の声」がヒットするなど、CMの枠を越えて文化現象化した。",
    learn: { kw: "ブランド キャラクター 戦略 マーケティング 書籍", label: "シリーズ設計を学ぶ" },
  },
  {
    id: "shiseido-highschool",
    yearNum: 2015, year: "2015",
    brand: "資生堂",
    title: "High School Girl? メーク女子高生のヒミツ",
    cats: ["バイラル動画", "どんでん返し"],
    videoId: "3TAHTG8kcH0",
    searchQuery: "資生堂 High School Girl メーク女子高生のヒミツ",
    summary: "教室の女子高生たちを次々と映していく動画。終盤、彼女たちが実はメークで変身した男子高校生だったと明かされる。メークの力を“衝撃の一手”で証明した。",
    why: "公開直後にSNSで世界中へ拡散し再生940万回超。ニューヨークフェスティバル最高賞、フランスEpica Awardsグランプリを受賞。日本発Web動画の海外バズの代表格。",
    learn: { kw: "動画広告 バイラル 企画 書籍", label: "バズる企画を学ぶ" },
  },
  {
    id: "pocari-dance",
    yearNum: 2016, year: "2016〜",
    brand: "ポカリスエット（大塚製薬）",
    title: "ガチダンス",
    cats: ["Web/TV", "シリーズ"],
    videoId: "5mLtHJAoTIY",
    searchQuery: "ポカリスエット ガチダンス CM 公式",
    summary: "数百〜数千人の中高生が校舎や街で全力でダンスする青春讃歌。八木莉可子らを中心に「踊る始業式」などスケールを年々拡大し、振付を一般に開放する仕掛けも添えた。",
    why: "関連動画の総再生は4,990万回超。汗・全力・青春という普遍のテーマを“参加できる”ダンスに落とし込み、視聴を体験へ変えたブランドCMの好例。",
    learn: { kw: "動画マーケティング ブランディング 書籍", label: "参加型施策を学ぶ" },
  },
  {
    id: "caloriemate",
    yearNum: 2016, year: "2012〜",
    brand: "カロリーメイト（大塚製薬）",
    title: "受験生応援シリーズ",
    cats: ["Web/TV", "シリーズ"],
    videoId: "",
    searchQuery: "カロリーメイト 受験生 CM 公式",
    summary: "受験というひと冬の戦いを、瑞々しい実写やアニメで描く毎年恒例のシリーズ。商品はほとんど映さず、頑張る誰かの背中をそっと押す“熱量”そのものを描く。",
    why: "毎年その年の受験生の心情に寄り添い、SNSで「泣ける」と話題に。商品広告でありながら季節の風物詩として定着した、日本的な共感型広告の到達点。",
    learn: { kw: "コピーライティング 広告コピーってこう書くんだ", label: "共感のコピーを学ぶ" },
  },
  {
    id: "georgia-work",
    yearNum: 2015, year: "2015〜",
    brand: "ジョージア（コカ・コーラ）",
    title: "世界は誰かの仕事でできている",
    cats: ["Web/TV", "シリーズ"],
    videoId: "-17stzM6wek",
    searchQuery: "ジョージア 世界は誰かの仕事でできている 山田孝之",
    summary: "山田孝之らがさまざまな職業の人を演じ、目立たない仕事に光をあてる缶コーヒーCM。「世界は誰かの仕事でできている」という一行のコピーがブランドの背骨になった。",
    why: "働く人すべてを肯定するメッセージが幅広い層に刺さり、コピーは流行語のように広まった。短い言葉ひとつでブランドの世界観を確立した好例。",
    learn: { kw: "コピーライティング ザ・コピーライティング 書籍", label: "強いコピーを学ぶ" },
  },
  {
    id: "nissin-hungrydays",
    yearNum: 2017, year: "2017〜",
    brand: "日清カップヌードル",
    title: "HUNGRY DAYS「アオハルかよ。」",
    cats: ["アニメWeb CM", "シリーズ"],
    videoId: "9_2ZHzprAno",
    searchQuery: "日清 カップヌードル HUNGRY DAYS アオハルかよ 公式",
    summary: "「魔女の宅急便」「アルプスの少女ハイジ」などの名作キャラを“現代の高校生”として描き直すアニメシリーズ。窪之内英策のキャラ、BUMP OF CHICKEN「記念撮影」が彩る。",
    why: "誰もが知る物語を青春群像に変換し「アオハルかよ。」というワードごとSNSで拡散。アニメ×ノスタルジー×音楽で、商品を語らず世代の心をつかんだ。",
    learn: { kw: "コンテンツマーケティング 動画 書籍", label: "コンテンツ設計を学ぶ" },
  },
  {
    id: "seibu-watashi",
    yearNum: 2019, year: "2019",
    brand: "そごう・西武",
    title: "わたしは、私。（炎上と議論を呼んだ一作）",
    cats: ["Web/新聞", "賛否両論"],
    videoId: "",
    searchQuery: "そごう西武 わたしは私 安藤サクラ 2019",
    summary: "安藤サクラの顔にパイが次々と投げつけられる正月広告。「女の時代、なんていらない？」というコピーと逆再生の演出で、女性をめぐる風潮へ問いを投げかけた（制作・フロンテッジ）。",
    why: "意図と受け取られ方が割れ、SNSで大論争に発展。企業が謝罪する事態にもなった。“攻めた広告”が抱えるリスクと、議論を起こす広告の功罪を考えさせる教材。",
    learn: { kw: "炎上 広告 リスク 危機管理 書籍", label: "炎上と表現リスクを学ぶ" },
  },
];

/* ---------- 書籍（アフィリエイトの主軸＝Amazon汎用検索） ---------- */
const BOOKS = [
  { kind: "コピー", title: "広告コピーってこう書くんだ！読本", author: "谷山雅計（宣伝会議）", why: "名コピーはどう生まれるか。発想の型を実例で叩き込む、コピーライティング入門の定番。", kw: "広告コピーってこう書くんだ 読本 谷山雅計" },
  { kind: "コピー", title: "ザ・コピーライティング", author: "ジョン・ケープルズ（ダイヤモンド社）", why: "見出しひとつで反応が何倍も変わる。100年読み継がれる反応率の科学。", kw: "ザ・コピーライティング ジョン・ケープルズ" },
  { kind: "Web", title: "沈黙のWebマーケティング", author: "松尾茂起（エムディエヌ）", why: "物語形式でSEOとWeb集客の全体像がつかめる。ネット広告の土台づくりに。", kw: "沈黙のWebマーケティング 松尾茂起" },
  { kind: "心理", title: "現代広告の心理技術101", author: "ドルー・E・ホイットマン", why: "人が買う理由＝心理トリガーを101個に分解。刺さる広告の裏側がわかる。", kw: "現代広告の心理技術101" },
  { kind: "コピー", title: "売れるコピーライティング単語帳", author: "神田昌典・衣田順一", why: "そのまま使える売れる言い回しを語彙として収録。手元に置く実務書。", kw: "売れるコピーライティング単語帳 神田昌典" },
  { kind: "戦略", title: "ハイパワー・マーケティング", author: "ジェイ・エイブラハム", why: "限られた資源で売上を伸ばす原則集。個人・小規模でも効く普遍の戦略。", kw: "ハイパワー・マーケティング ジェイ・エイブラハム" },
];

/* ---------- ツール ---------- */
const TOOLS = [
  { key: "canva",  t: "Canva",            d: "広告バナー・SNS画像を最速で", icon: "M3 3h18v18H3z" },
  { key: "adobe",  t: "Adobe Express",     d: "プロ品質のデザインを手軽に",   icon: "M12 2l10 18H2z" },
  { key: "capcut", t: "CapCut",            d: "縦型動画・ショート編集の定番", icon: "M4 4h16v16H4z" },
  { key: "filmora",t: "Filmora",           d: "本格的な動画編集を始めるなら", icon: "M5 3l14 9-14 9z" },
  { key: "udemy",  t: "Udemy（広告・動画講座）", d: "現役プロの実践講座を買い切りで", icon: "M12 3L2 8l10 5 10-5z" },
];

/* ---------- SVGアイコン ---------- */
const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  ext:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
};

/* ---------- 描画 ---------- */
function render(filter = "すべて") {
  const sorted = [...EXHIBITS].sort((a, b) => b.yearNum - a.yearNum);
  const list = filter === "すべて" ? sorted : sorted.filter(e => e.cats.includes(filter));
  const g = document.getElementById("gallery");
  g.innerHTML = list.map(exhibitCard).join("");
  bindPosters();
}

function exhibitCard(e) {
  const watch = e.videoId
    ? `https://www.youtube.com/watch?v=${e.videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(e.searchQuery)}`;

  const frame = e.videoId
    ? `<div class="frame" data-vid="${e.videoId}">
         <div class="frame__poster" role="button" tabindex="0" aria-label="${escapeAttr(e.title)} の動画を再生">
           <div class="play">${ICON.play}</div>
           <div class="ptxt"><b>${e.year}</b> ・ クリックで再生</div>
         </div>
       </div>`
    : `<a class="frame" href="${watch}" target="_blank" rel="noopener" aria-label="${escapeAttr(e.title)} を YouTube で見る">
         <div class="frame__poster">
           <div class="play">${ICON.play}</div>
           <div class="ptxt"><b>${e.year}</b> ・ 公式動画を YouTube で探す</div>
         </div>
       </a>`;

  return `
  <article class="exhibit">
    ${frame}
    <div class="placard">
      <div class="placard__meta">
        <span class="placard__year">${e.year}</span>
        <span class="placard__brand">${e.brand}</span>
      </div>
      <h3 class="placard__title">${e.title}</h3>
      <div class="placard__tags">${e.cats.map(c => `<span class="tag">${c}</span>`).join("")}</div>
      <p class="placard__body">${e.summary}</p>
      <p class="placard__why"><b>なぜ伝説か。</b>${e.why}</p>
      <div class="placard__foot">
        <a class="linkout" href="${watch}" target="_blank" rel="noopener">${ICON.ext} 動画を見る</a>
        <a class="learn-link" href="${amazonSearch(e.learn.kw)}" target="_blank" rel="noopener sponsored">${e.learn.label}</a>
      </div>
    </div>
  </article>`;
}

function bindPosters() {
  document.querySelectorAll(".frame[data-vid] .frame__poster").forEach(p => {
    const open = () => {
      const f = p.closest(".frame");
      const vid = f.getAttribute("data-vid");
      f.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0"
                 title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowfullscreen loading="lazy"></iframe>`;
    };
    p.addEventListener("click", open);
    p.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } });
  });
}

function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

/* ---------- ショップ描画 ---------- */
function renderShop() {
  document.getElementById("shelf").innerHTML = BOOKS.map(b => `
    <div class="book">
      <div class="book__kind">${b.kind}</div>
      <h4 class="book__title">${b.title}</h4>
      <div class="book__author">${b.author}</div>
      <p class="book__why">${b.why}</p>
      <a class="book__cta" href="${amazonSearch(b.kw)}" target="_blank" rel="noopener sponsored">${ICON.cart} Amazonで見る</a>
    </div>`).join("");

  document.getElementById("toolGrid").innerHTML = TOOLS.map(t => `
    <a class="tool" href="${toolLink(t.key)}" target="_blank" rel="noopener sponsored">
      <span class="tool__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${t.icon}"/></svg></span>
      <span><span class="tool__t">${t.t}</span><br><span class="tool__d">${t.d}</span></span>
    </a>`).join("");
}

/* ---------- フィルター ---------- */
function buildFilters() {
  const cats = ["すべて", ...new Set(EXHIBITS.flatMap(e => e.cats))];
  const bar = document.getElementById("filters");
  bar.innerHTML = cats.map((c, i) =>
    `<button class="chip ${i === 0 ? "is-active" : ""}" data-cat="${c}">${c}</button>`).join("");
  bar.addEventListener("click", ev => {
    const btn = ev.target.closest(".chip");
    if (!btn) return;
    bar.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    render(btn.dataset.cat);
  });
}

/* ---------- 起動 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildFilters();
  render();
  renderShop();
  document.getElementById("year").textContent = "2026";
  document.getElementById("count").textContent = EXHIBITS.length;
});
