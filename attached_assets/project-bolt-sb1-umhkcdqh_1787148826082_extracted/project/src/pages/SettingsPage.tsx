import { useState } from 'react';
import { Bell, Moon, Settings as SettingsIcon, SortAsc, Sun } from 'lucide-react';
import type { Settings, SortMode } from '@/types';
import { settingsRepo } from '@/lib/db';

interface SettingsPageProps {
  settings: Settings;
  reload: () => Promise<void>;
}

export function SettingsPage({ settings, reload }: SettingsPageProps) {
  const [local, setLocal] = useState(settings);

  const update = async (patch: Partial<Settings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    await settingsRepo.put(next);
    await reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="text-primary-500" size={26} />
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          الإعدادات
        </h1>
      </div>

      {/* Sort order */}
      <div className="card p-6">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
          <SortAsc size={20} className="text-primary-500" />
          ترتيب عرض الكورسات
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          كيف ترتب الكورسات في صفحة الكورسات
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              { v: 'importance', label: 'حسب الأهمية' },
              { v: 'created', label: 'تاريخ الإضافة' },
              { v: 'alphabetical', label: 'أبجدياً' },
            ] as { v: SortMode; label: string }[]
          ).map((opt) => (
            <button
              key={opt.v}
              onClick={() => update({ default_sort: opt.v })}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                local.default_sort === opt.v
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder */}
      <div className="card p-6">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
          <Bell size={20} className="text-gold-500" />
          تذكير بالمتابعة
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          تذكير بالكورسات التي لم تفتحها منذ فترة
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            تفعيل التذكير
          </span>
          <Toggle
            checked={local.reminder_enabled}
            onChange={(v) => update({ reminder_enabled: v })}
          />
        </div>
        {local.reminder_enabled && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              عدد أيام التنبيه
            </span>
            <input
              type="number"
              min={1}
              max={90}
              className="input w-24 text-center"
              value={local.reminder_days}
              onChange={(e) =>
                update({ reminder_days: Number(e.target.value) || 1 })
              }
            />
          </div>
        )}
      </div>

      {/* Dark mode */}
      <div className="card p-6">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
          <Moon size={20} className="text-primary-500" />
          الوضع الليلي
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          اختر مظهر الموقع
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              { v: 'auto', label: 'تلقائي', icon: Sun },
              { v: 'light', label: 'فاتح', icon: Sun },
              { v: 'dark', label: 'ليلي', icon: Moon },
            ] as { v: Settings['dark_mode']; label: string; icon: typeof Sun }[]
          ).map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.v}
                onClick={() => update({ dark_mode: opt.v })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  local.dark_mode === opt.v
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language (info only) */}
      <div className="card p-6">
        <h2 className="mb-1 text-base font-bold text-slate-800 dark:text-white">
          اللغة
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">عربي فقط</p>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        checked ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'right-1' : 'right-6'
        }`}
      />
    </button>
  );
}
