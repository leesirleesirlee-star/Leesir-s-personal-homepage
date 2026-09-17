-- ============================================================
-- Nick Lee Personal Homepage — V3 Supabase 一键初始化脚本
-- 用法：Supabase 控制台 → SQL Editor → New query → 全文粘贴 → Run
-- 幂等设计：可重复执行，不会报错或丢数据
-- 对应设计文档：docs/v3-design.md §4
-- ============================================================

-- ---------- 1. feedback 表（PRD V3.2 访客反馈） ----------
create table if not exists feedback (
  id         bigint generated always as identity primary key,
  content    text not null check (char_length(content) between 1 and 2000),
  contact    text check (contact is null or char_length(contact) <= 200),
  lang       text not null default 'zh' check (lang in ('zh', 'en')),
  page       text,
  created_at timestamptz not null default now()
);

-- ---------- 2. project_stats 表（浏览量 / 喜爱量） ----------
create table if not exists project_stats (
  project_id text primary key,
  views      integer not null default 0 check (views >= 0),
  likes      integer not null default 0 check (likes >= 0),
  updated_at timestamptz not null default now()
);

-- 种子数据：两个项目的计数行（重复执行不会覆盖已有计数）
insert into project_stats (project_id) values ('resin'), ('forum')
on conflict (project_id) do nothing;

-- ---------- 3. comments 表（项目留言） ----------
create table if not exists comments (
  id         bigint generated always as identity primary key,
  project_id text not null references project_stats(project_id),
  nickname   text not null default '访客' check (char_length(nickname) between 1 and 30),
  content    text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

-- ---------- 4. 启用 RLS（Row Level Security，PRD V3.4 硬性要求） ----------
alter table feedback      enable row level security;
alter table project_stats enable row level security;
alter table comments      enable row level security;

-- ---------- 5. RLS 策略 ----------
-- feedback：访客仅可插入；无 SELECT 策略 → 访客互不可见，仅本人在控制台可读
drop policy if exists "anon insert feedback" on feedback;
create policy "anon insert feedback" on feedback
  for insert to anon with check (true);

-- project_stats：访客仅可读；无 INSERT/UPDATE/DELETE 策略 → 计数只能走 RPC
drop policy if exists "anon read stats" on project_stats;
create policy "anon read stats" on project_stats
  for select to anon using (true);

-- comments：访客可读 + 可插入（公开留言墙）；不可改/删
drop policy if exists "anon read comments" on comments;
create policy "anon read comments" on comments
  for select to anon using (true);

drop policy if exists "anon insert comments" on comments;
create policy "anon insert comments" on comments
  for insert to anon with check (true);

-- ---------- 6. RPC 原子自增函数 ----------
-- security definer：以建表者权限执行，绕过 RLS 但只暴露 "+1" 能力
-- set search_path：防止 search_path 注入攻击（安全加固标准写法）
create or replace function increment_views(p_project_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_views integer;
begin
  insert into project_stats (project_id, views)
  values (p_project_id, 1)
  on conflict (project_id)
  do update set views = project_stats.views + 1, updated_at = now()
  returning views into new_views;
  return new_views;
end;
$$;

create or replace function increment_likes(p_project_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_likes integer;
begin
  insert into project_stats (project_id, likes)
  values (p_project_id, 1)
  on conflict (project_id)
  do update set likes = project_stats.likes + 1, updated_at = now()
  returning likes into new_likes;
  return new_likes;
end;
$$;

-- 允许匿名访客调用（也只能调用）这两个函数
grant execute on function increment_views(text) to anon;
grant execute on function increment_likes(text) to anon;

-- ---------- 7. 验证清单（执行后可逐条人工核对） ----------
-- ① Table Editor 应出现 feedback / project_stats / comments 三表
-- ② project_stats 应有 resin、forum 两行，views/likes 均为 0
-- ③ Database → Policies 应看到 4 条策略（每表图标为 RLS 开启）
-- ④ SQL 自测：select increment_views('resin'); 应返回 1（再跑 v3-supabase-setup.sql 可重复初始化，计数不会被清零）
-- ============================================================
