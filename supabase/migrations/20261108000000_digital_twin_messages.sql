-- ============================================================
-- 数字分身聊天记录
-- 用途：保存每次文本/语音问答，便于在 Supabase 后台查看与复盘。
-- 隐私：只记录当前问题与回答；不记录 system prompt、完整 history、IP 或 UA。
-- 幂等：可重复执行。
-- ============================================================

create table if not exists public.digital_twin_messages (
  id         bigint generated always as identity primary key,
  session_id text not null check (char_length(session_id) between 8 and 64),
  request_id uuid not null,
  question   text not null check (char_length(question) between 1 and 2000),
  answer     text not null check (char_length(answer) between 1 and 4000),
  lang       text not null default 'zh' check (lang in ('zh', 'en')),
  source     text not null check (source in ('text', 'voice')),
  created_at timestamptz not null default now()
);

comment on table public.digital_twin_messages is '数字分身问答记录：每次成功回答写入一行，仅供后台复盘。';
comment on column public.digital_twin_messages.session_id is '匿名会话 ID，用于串联同一标签页内的多轮对话。';
comment on column public.digital_twin_messages.request_id is '本次请求 ID，用于与服务端日志对应。';
comment on column public.digital_twin_messages.source is '输入来源：text=文字输入，voice=语音输入。';
comment on column public.digital_twin_messages.lang is '界面语言 zh/en，不等同于问题文本的语种。';

create index if not exists digital_twin_messages_created_at_idx
  on public.digital_twin_messages (created_at desc);

create index if not exists digital_twin_messages_session_idx
  on public.digital_twin_messages (session_id, created_at);

alter table public.digital_twin_messages enable row level security;

-- 不创建任何匿名/登录用户策略：访客不能读、不能写。
-- Edge Function 使用 service_role 写入；Supabase 控制台使用 service_role 查看。
revoke all on table public.digital_twin_messages from anon, authenticated;
grant select, insert on table public.digital_twin_messages to service_role;
grant usage, select on sequence public.digital_twin_messages_id_seq to service_role;
