import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useData } from '@/lib/useData';
import { useDarkMode } from '@/lib/theme';
import type { Page } from '@/types';
import { LoginPage } from '@/components/LoginPage';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { CoursesPage } from '@/pages/CoursesPage';
import { SearchPage } from '@/pages/SearchPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BackupPage } from '@/pages/BackupPage';

function AppInner() {
  const { isAuthed } = useAuth();
  const data = useData();
  useDarkMode(data.settings);
  const [page, setPage] = useState<Page>({ name: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthed) return <LoginPage />;

  if (data.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-beige-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const renderPage = () => {
    switch (page.name) {
      case 'dashboard':
        return (
          <Dashboard
            nodes={data.nodes}
            reminderEnabled={data.settings.reminder_enabled}
            reminderDays={data.settings.reminder_days}
            onNavigate={navigate}
          />
        );
      case 'courses':
        return (
          <CoursesPage
            nodes={data.nodes}
            sortMode={data.settings.default_sort}
            onNavigate={navigate}
            reload={data.reload}
          />
        );
      case 'search':
        return <SearchPage nodes={data.nodes} onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage settings={data.settings} reload={data.reload} />;
      case 'backup':
        return <BackupPage nodes={data.nodes} reload={data.reload} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-beige-50 dark:bg-slate-950">
      <Sidebar
        page={page}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="فتح القائمة"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-slate-700 dark:text-white">
            سلم الصعود
          </span>
          <span className="w-9" />
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 lg:p-8">
          <div className="animate-fade-in">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
