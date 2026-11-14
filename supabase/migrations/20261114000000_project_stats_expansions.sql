-- ============================================================
-- 项目互动统计：新增 ExpResin 与 Binary Repair
-- 用途：为两个新项目预置 project_stats 行，保证留言外键可用。
-- 幂等：可重复执行。
-- 说明：打开项目详情时 increment_views 也会自动建行；
--       这里显式补种子，避免首次打开即留言时外键先失败。
-- ============================================================

insert into public.project_stats (project_id)
values ('expresin'), ('binrepair')
on conflict (project_id) do nothing;
