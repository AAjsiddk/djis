import { useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import type { Page, TreeNode } from '@/types';
import { pathOf } from '@/lib/useData';

interface SearchPageProps {
  nodes: TreeNode[];
  onNavigate: (p: Page) => void;
}

export function SearchPage({ nodes, onNavigate }: SearchPageProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.notes.toLowerCase().includes(q),
      )
      .map((n) => ({
        id: n.id,
        name: n.name,
        path: pathOf(nodes, n.id)
          .slice(0, -1)
          .map((p) => p.name)
          .join(' / '),
        is_completed: n.is_completed,
      }));
  }, [query, nodes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SearchIcon className="text-primary-500" size={26} />
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          بحث
        </h1>
      </div>

      <div className="relative">
        <SearchIcon
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="input py-3.5 pr-11 text-base"
          placeholder="ابحث في سلم الصعود..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {query.trim() && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {results.length > 0
            ? `${results.length} نتيجة`
            : 'لا توجد نتائج مطابقة'}
        </p>
      )}

      <div className="space-y-2">
        {results.map((r) => (
          <button
            key={r.id}
            onClick={() => onNavigate({ name: 'courses' })}
            className="card card-hover flex w-full items-center gap-3 p-4 text-right"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800 dark:text-white">
                {r.name}
              </p>
              {r.path && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {r.path}
                </p>
              )}
            </div>
            {r.is_completed && (
              <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                مكتمل
              </span>
            )}
          </button>
        ))}
      </div>

      {!query.trim() && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-400 dark:bg-primary-900/30">
            <SearchIcon size={32} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ابحث في الكورسات والعناوين الفرعية والملاحظات
          </p>
        </div>
      )}
    </div>
  );
}
