import {
  BookOpen,
  Home,
  LogOut,
  Package,
  Search,
  Settings as SettingsIcon,
  TrendingUp,
  X,
} from 'lucide-react';
import type { Page } from '@/types';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  open: boolean;
  onClose: () => void;
}

const NAV: { key: Page['name']; label: string; icon: typeof Home }[] = [
  { key: 'dashboard', label: 'الرئيسية', icon: Home },
  { key: 'courses', label: 'الكورسات', icon: BookOpen },
  { key: 'search', label: 'بحث', icon: Search },
  { key: 'settings', label: 'إعدادات', icon: SettingsIcon },
  { key: 'backup', label: 'نسخ احتياطي', icon: Package },
];

export function Sidebar({ page, onNavigate, open, onClose }: SidebarProps) {
  const { logout } = useAuth();

  const handleNav = (p: Page) => {
    onNavigate(p);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-slate-200 bg-white transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-soft">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">
                سلم الصعود
              </h1>
              <p className="text-[11px] font-medium text-slate-400">
                كل يوم وانت طالع درجة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = page.name === key;
            return (
              <button
                key={key}
                onClick={() => handleNav({ name: key } as Page)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon
                  size={20}
                  className={active ? 'text-primary-600 dark:text-primary-400' : ''}
                />
                {label}
                {active && (
                  <span className="mr-auto h-2 w-2 rounded-full bg-gold-500" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
