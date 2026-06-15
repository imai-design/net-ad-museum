-- ===========================================================
-- 広告ハント「みんなの壁」 Supabase セットアップ
-- Supabase ダッシュボード > SQL Editor に貼って実行する。
-- 完了後、config.js に Project URL と anon public キーを設定すれば点灯する。
-- anon キーは公開してよい設計（下記ポリシーで挿入は anon に限定的に許可）。
-- ===========================================================

-- 1) テーブル
create table if not exists public.catches (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  brand       text,
  genre       text,
  place       text,
  caption     text,
  rarity      text,
  holo        boolean default false,
  image_url   text not null
);

-- 2) 行レベルセキュリティ
alter table public.catches enable row level security;

-- 公開フィードなので誰でも閲覧可
create policy "catches are public to read"
  on public.catches for select
  using ( true );

-- 投稿は anon に許可（必要に応じて後でレート制限・審査に差し替える）
create policy "anyone can insert a catch"
  on public.catches for insert
  with check ( true );

-- 3) ストレージ（公開バケット catches）
insert into storage.buckets (id, name, public)
values ('catches', 'catches', true)
on conflict (id) do nothing;

-- 画像の閲覧は公開
create policy "catch images are public"
  on storage.objects for select
  using ( bucket_id = 'catches' );

-- 画像のアップロードは anon に許可
create policy "anyone can upload a catch image"
  on storage.objects for insert
  with check ( bucket_id = 'catches' );

-- ===========================================================
-- 運用メモ:
--  ・荒らし対策が必要になったら insert ポリシーを厳格化する
--    （reCAPTCHA / Edge Function 経由 / モデレーション列 approved 追加など）。
--  ・不適切投稿は SQL で delete、または approved=false 既定＋審査制に切り替える。
-- ===========================================================
