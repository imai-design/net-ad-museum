/* ===========================================================
   軽量アクセス解析（既定オフ・プライバシー配慮）
   - 「皆んな使ってる？」を推測でなく数字で見るための土台。
   - 既定では何も読み込まない＝外部送信ゼロ。点灯するまで完全に静か。
   - 有効化（無料・約60秒）:
       1) https://www.goatcounter.com/ で無料アカウント作成（コード名 例: adhunt）
       2) 下の goatcounter に「https://<コード名>.goatcounter.com/count」を入れる
   - GoatCounterはCookie不使用・個人を追跡しない集計のみ（訪問数/人気ページ等）。
   =========================================================== */
window.ADHUNT_ANALYTICS = {
  goatcounter: "", // 例: "https://adhunt.goatcounter.com/count"
};
(function () {
  var u = (window.ADHUNT_ANALYTICS && window.ADHUNT_ANALYTICS.goatcounter) || "";
  if (!u) return; // 未設定なら一切読み込まない
  var s = document.createElement("script");
  s.async = true;
  s.src = "//gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", u);
  document.head.appendChild(s);
})();
