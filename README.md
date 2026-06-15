# ネット広告博物館 — The Museum of Japanese Internet Advertising

日本のインターネット広告の名作・伝説的キャンペーンを年代別に展示し、「なぜ伝説になったのか」を一作ずつ解説するキュレーション博物館サイト。アフィリエイト（Amazonアソシエイト＋各種ASP）で運営する。

公開URL: https://imai-design.github.io/net-ad-museum/

## 構成

```
index.html    … 博物館本体（ヒーロー／展示室／ミュージアムショップ／About）
style.css    … デザインシステム（美術館テイスト・絵文字不使用）
app.js       … 展示データ・描画・フィルター・アフィリエイト設定
```

すべて静的ファイル。ビルド不要。`python3 -m http.server` で確認できる。

## 収益（アフィリエイト）の設定

`app.js` 冒頭の `AFFILIATE` だけ書き換えれば有効化できる。

1. **Amazonアソシエイト**（主軸）
   - `AFFILIATE.amazonTag` を自分のトラッキングID（例 `ryoseiworld-22`）に変更する。
   - 本・各展示の「学ぶ」リンクはすべてAmazon検索URLに `tag=` を付けて生成しているので、ID差し替えだけで全リンクが収益化される。
2. **講座・ツール**（A8.net / もしもアフィリエイト等）
   - ASPで提携承認を取り、発行された広告リンクを `AFFILIATE.links` の各キー（udemy / canva / adobe / capcut / filmora）に貼る。
   - 空のままなら公式サイトへ通常リンクする（クリックは機能するが報酬は付かない）。

## 展示の追加・編集

`app.js` の `EXHIBITS` 配列に1件追加するだけ。

```js
{
  id, yearNum, year, brand, title,
  cats: ["カテゴリ", ...],     // フィルターに自動反映
  videoId: "YouTubeのID",      // 確実な公式動画があれば埋め込み。無ければ ""
  searchQuery: "公式検索語",    // videoId が空のとき YouTube 検索リンクに使う
  summary, why,                // 解説（独自に記述）
  learn: { kw: "Amazon検索語", label: "ボタン文言" },
}
```

## 著作権の方針

広告クリエイティブそのものは転載しない。各作品は企業／YouTube公式の動画への**埋め込み・リンク**で紹介し、解説文は独自に記述する。削除依頼には速やかに対応する。

## 事実確認

各作品の公開年・受賞・反響は公開情報で裏取り済み（2026-06-15時点）。時期に幅があるものは「〜頃」「〜年〜」と表記。

---
RYOSEIWORLD / 2026
