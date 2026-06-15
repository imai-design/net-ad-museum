/* ===========================================================
   広告ハント — 共有設定
   「みんなの壁」（全ユーザー共有フィード）を使うときだけ設定する。
   未設定なら、ハントは「自分の図鑑」(端末内)＋SNSシェアで完全に動作する。

   ▼ みんなの壁の有効化（無料・約5分）
   1. https://supabase.com で無料プロジェクトを作る
   2. SQL Editor で setup/supabase.sql を実行（テーブル+公開バケット+権限）
   3. Project Settings > API の「Project URL」と「anon public」キーを下に貼る
      ※ anon key は公開してよい設計（行レベルセキュリティで保護）
   =========================================================== */
window.AD_HUNT_CONFIG = {
  supabaseUrl: "",   // 例: https://xxxxxxxx.supabase.co
  supabaseAnonKey: "", // 例: eyJhbGciOi...（anon public）
  bucket: "catches",  // ストレージのバケット名（公開）
  table: "catches",   // テーブル名
};
