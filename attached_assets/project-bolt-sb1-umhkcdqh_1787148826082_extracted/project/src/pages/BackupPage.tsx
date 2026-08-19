import { useRef, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  FileJson,
  Package,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import type { BackupData, TreeNode } from '@/types';
import { deleteAllData, exportBackup, importBackup } from '@/lib/db';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface BackupPageProps {
  nodes: TreeNode[];
  reload: () => Promise<void>;
}

export function BackupPage({ nodes, reload }: BackupPageProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');

  const flash = (m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(''), 3000);
  };

  const downloadJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleExport = async () => {
    const data = await exportBackup();
    downloadJSON(
      data,
      `sulm-alsuud-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    flash('تم تحميل النسخة الاحتياطية بنجاح');
  };

  const handleExportLog = async () => {
    const completed = nodes.filter((n) => n.is_completed);
    const log = {
      exported_at: new Date().toISOString(),
      total_completed: completed.length,
      items: completed.map((n) => ({
        id: n.id,
        name: n.name,
        completed_at: n.completed_at,
      })),
    };
    downloadJSON(
      log,
      `sulm-alsuud-progress-${new Date().toISOString().slice(0, 10)}.json`,
    );
    flash('تم تصدير سجل الإنجاز');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result)) as BackupData;
        await importBackup(data);
        await reload();
        flash('تم استعادة النسخة الاحتياطية بنجاح');
      } catch {
        flash('فشل: الملف غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="text-primary-500" size={26} />
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          النسخ الاحتياطي
        </h1>
      </div>

      <div className="card flex items-start gap-3 border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/10">
        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-emerald-500" />
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          كل بياناتك تُحفظ في متصفحك فقط، على جهازك، لا أحد يراها سواك.
        </p>
      </div>

      {message && (
        <div className="animate-fade-in flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Export */}
        <div className="card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
            <Download size={24} />
          </div>
          <h2 className="mb-1 font-bold text-slate-800 dark:text-white">
            تحميل نسخة احتياطية
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            ملف JSON يحتوي على كل الكورسات والعناوين الفرعية والإعدادات
          </p>
          <button onClick={handleExport} className="btn-secondary w-full">
            <FileJson size={18} />
            تصدير كل البيانات
          </button>
        </div>

        {/* Import */}
        <div className="card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300">
            <Upload size={24} />
          </div>
          <h2 className="mb-1 font-bold text-slate-800 dark:text-white">
            استعادة نسخة
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            ارفع ملف JSON لاستعادة بياناتك (سيستبدل البيانات الحالية)
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-primary w-full"
          >
            <Upload size={18} />
            استعادة من ملف
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Export progress log */}
      <div className="card p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
          <Database size={24} />
        </div>
        <h2 className="mb-1 font-bold text-slate-800 dark:text-white">
          تصدير سجل الإنجاز
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          ملف يحتوي على العناوين المكتملة فقط وتواريخ إكمالها
        </p>
        <button onClick={handleExportLog} className="btn-outline">
          <Download size={18} />
          تصدير سجل الإنجاز
        </button>
      </div>

      {/* Danger zone */}
      <div className="card border-red-200 p-6 dark:border-red-900/40">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
          <Trash2 size={24} />
        </div>
        <h2 className="mb-1 font-bold text-red-600 dark:text-red-400">
          حذف كل البيانات
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          سيتم حذف كل الكورسات والعناوين الفرعية والملاحظات نهائيًا. لا يمكن التراجع عن هذه العملية.
        </p>
        <button onClick={() => setConfirmDelete(true)} className="btn-danger">
          <Trash2 size={18} />
          حذف كل بياناتي نهائيًا
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteAllData();
          await reload();
          flash('تم حذف جميع البيانات');
        }}
        title="حذف كل البيانات"
        message="هل أنت متأكد؟ سيتم مسح كل الكورسات والعناوين الفرعية والملاحظات. لن تتمكن من استرجاعها."
        confirmText="حذف نهائي"
        danger
      />
    </div>
  );
}
