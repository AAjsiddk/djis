import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Flame,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import type { Page, TreeNode } from '@/types';
import {
  buildTree,
  nodeProgress,
  overallProgress,
  pathOf,
} from '@/lib/useData';
import { ProgressBar } from '@/components/ProgressBar';

interface DashboardProps {
  nodes: TreeNode[];
  reminderEnabled: boolean;
  reminderDays: number;
  onNavigate: (p: Page) => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}
        >
          <Icon size={24} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {value}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({
  nodes,
  reminderEnabled,
  reminderDays,
  onNavigate,
}: DashboardProps) {
  const roots = nodes.filter((n) => n.parent_id === null);
  const overall = overallProgress(nodes);

  const completedRoots = roots.filter((n) => {
    const p = nodeProgress(nodes, n.id);
    return p.total > 0 && p.percent === 100;
  }).length;

  const completedLeaves = nodes.filter((n) => n.is_completed).length;
  const totalLeaves = nodes.length;

  // last opened — approximate by latest created/completed
  const lastCompleted = nodes
    .filter((n) => n.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime(),
    )[0];

  // reminders: roots not touched (no completed descendants) in > reminderDays
  const now = Date.now();
  const reminders = reminderEnabled
    ? roots.filter((r) => {
        const desc = nodes.filter((n) => {
          const path = pathOf(nodes, n.id);
          return path.some((p) => p.id === r.id);
        });
        if (desc.length === 0) return true; // no content yet
        const lastActivity = desc
          .filter((d) => d.completed_at)
          .sort(
            (a, b) =>
              new Date(b.completed_at!).getTime() -
              new Date(a.completed_at!).getTime(),
          )[0];
        if (!lastActivity) return true;
        const days =
          (now - new Date(lastActivity.completed_at!).getTime()) /
          (1000 * 60 * 60 * 24);
        return days > reminderDays;
      })
    : [];

  // top 3 active roots by progress
  const topRoots = [...roots]
    .map((r) => ({ r, p: nodeProgress(nodes, r.id) }))
    .filter((x) => x.p.total > 0)
    .sort((a, b) => b.p.percent - a.p.percent)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-gold-500" size={28} />
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            لوحة التحكم
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          مرحبًا بك في سلم الصعود — نظّم رحلتك التعليمية واصعد درجة كل يوم
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="عدد الكورسات"
          value={roots.length}
          accent="bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300"
        />
        <StatCard
          icon={CheckCircle2}
          label="الكورسات المكتملة"
          value={completedRoots}
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
        />
        <StatCard
          icon={ClipboardList}
          label="إجمالي العناوين"
          value={totalLeaves}
          accent="bg-gold-100 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300"
        />
        <StatCard
          icon={TrendingUp}
          label="العناوين المكتملة"
          value={completedLeaves}
          accent="bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300"
        />
      </div>

      {/* Overall progress */}
      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
            <TrendingUp size={20} className="text-primary-500" />
            نسبة الإنجاز الإجمالية
          </h2>
          <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
            {overall.percent}%
          </span>
        </div>
        <ProgressBar percent={overall.percent} size="lg" />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          أكملت {overall.completed} من {overall.total} عنوان في جميع الكورسات
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last completed */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
            <Clock size={20} className="text-gold-500" />
            آخر عنوان أكملته
          </h2>
          {lastCompleted ? (
            <button
              onClick={() => onNavigate({ name: 'courses' })}
              className="group block w-full text-right"
            >
              <div className="rounded-xl bg-slate-50 p-4 transition-colors group-hover:bg-primary-50 dark:bg-slate-700/50 dark:group-hover:bg-primary-900/20">
                <p className="text-xs font-medium text-slate-400">
                  {pathOf(nodes, lastCompleted.id)
                    .slice(0, -1)
                    .map((p) => p.name)
                    .join(' / ')}
                </p>
                <p className="mt-1 font-bold text-slate-800 dark:text-white">
                  {lastCompleted.name}
                </p>
              </div>
            </button>
          ) : (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400 dark:bg-slate-700/50">
              لم تكمل أي عنوان بعد. ابدأ بإضافة كورس!
            </div>
          )}
        </div>

        {/* Top progress */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
            <Flame size={20} className="text-gold-500" />
            الأكثر تقدمًا
          </h2>
          {topRoots.length ? (
            <div className="space-y-2">
              {topRoots.map(({ r, p }) => (
                <button
                  key={r.id}
                  onClick={() => onNavigate({ name: 'courses' })}
                  className="group flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-right transition-colors hover:bg-primary-50 dark:bg-slate-700/50 dark:hover:bg-primary-900/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 dark:text-white">
                      {r.name}
                    </p>
                    <ProgressBar percent={p.percent} size="sm" className="mt-2" />
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary-600 dark:text-primary-400">
                    {p.percent}%
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400 dark:bg-slate-700/50">
              لا يوجد نشاط بعد
            </div>
          )}
        </div>
      </div>

      {/* Reminders */}
      {reminderEnabled && reminders.length > 0 && (
        <div className="card border-gold-200 bg-gold-50/50 p-6 dark:border-gold-900/40 dark:bg-gold-900/10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
            <Clock size={20} className="text-gold-500" />
            تذكير بالمتابعة
          </h2>
          <div className="space-y-2">
            {reminders.slice(0, 4).map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate({ name: 'courses' })}
                className="flex w-full items-center justify-between rounded-xl bg-white/80 p-3 text-right transition-colors hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {r.name}
                </span>
                <span className="text-xs font-medium text-gold-600 dark:text-gold-400">
                  لم تُكمله بعد
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
