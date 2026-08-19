import { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Circle,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  StickyNote,
} from 'lucide-react';
import type { Page, TreeNode } from '@/types';
import {
  TreeItem,
  nodeProgress,
} from '@/lib/useData';
import { ProgressBar } from '@/components/ProgressBar';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface TreeRowProps {
  node: TreeItem;
  depth: number;
  siblings: TreeItem[];
  allNodes: TreeNode[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onMove: (node: TreeNode, dir: -1 | 1) => void;
  onToggleComplete: (node: TreeNode) => void;
  onNavigate: (p: Page) => void;
}

export function TreeRow({
  node,
  depth,
  siblings,
  allNodes,
  expanded,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
  onToggleComplete,
}: TreeRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const progress = nodeProgress(allNodes, node.id);
  const index = siblings.findIndex((s) => s.id === node.id);

  const indent = depth * 24;

  return (
    <div>
      <div
        className="group flex items-start gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-3 transition-all hover:border-primary-200 hover:shadow-soft dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-primary-700"
        style={{ marginInlineStart: indent }}
      >
        {/* Expand/collapse */}
        <button
          onClick={() => hasChildren && onToggle(node.id)}
          className={`mt-0.5 shrink-0 rounded-md p-0.5 transition-colors ${
            hasChildren
              ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              : 'text-transparent'
          }`}
          aria-label={isExpanded ? 'طي' : 'توسيع'}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronLeft size={18} />
            ))}
        </button>

        {/* Completion toggle */}
        <button
          onClick={() => onToggleComplete(node)}
          className="mt-0.5 shrink-0"
          aria-label={node.is_completed ? 'إلغاء الإكمال' : 'إكمال'}
        >
          {node.is_completed ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <Circle
              size={20}
              className="text-slate-300 transition-colors hover:text-gold-400 dark:text-slate-600"
            />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`font-semibold ${
                node.is_completed
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-800 dark:text-white'
              }`}
            >
              {node.name}
            </span>
          </div>

          {node.link && (
            <a
              href={node.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              فتح الرابط
            </a>
          )}

          {node.notes && (
            <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <StickyNote size={12} className="mt-0.5 shrink-0 text-gold-400" />
              <span className="whitespace-pre-wrap">{node.notes}</span>
            </p>
          )}

          {/* Progress display for all nodes */}
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar percent={progress.percent} size="sm" className="flex-1" />
            <span className="shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
              {progress.percent}%
            </span>
            {hasChildren && (
              <span className="shrink-0 text-[11px] text-slate-400">
                ({progress.completed}/{progress.total})
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button
            onClick={() => onAddChild(node.id)}
            className="btn-ghost p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            aria-label="إضافة فرع"
            title="إضافة فرع"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="btn-ghost p-1.5"
            aria-label="تعديل"
            title="تعديل"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="حذف"
            title="حذف"
          >
            <Trash2 size={15} />
          </button>
          <div className="flex flex-col">
            <button
              onClick={() => onMove(node, -1)}
              disabled={index === 0}
              className="btn-ghost p-0.5 disabled:opacity-30"
              aria-label="أعلى"
            >
              <ArrowUp size={13} />
            </button>
            <button
              onClick={() => onMove(node, 1)}
              disabled={index === siblings.length - 1}
              className="btn-ghost p-0.5 disabled:opacity-30"
              aria-label="أسفل"
            >
              <ArrowDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-1.5 space-y-1.5">
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              siblings={node.children}
              allNodes={allNodes}
              expanded={expanded}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              onToggleComplete={onToggleComplete}
              onNavigate={() => {}}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => onDelete(node)}
        title="حذف العنصر"
        message={
          hasChildren
            ? `سيتم حذف "${node.name}" وكل ما يحتويه من عناوين فرعية نهائيًا. هل أنت متأكد؟`
            : `سيتم حذف "${node.name}" نهائيًا. هل أنت متأكد؟`
        }
        confirmText="حذف"
        danger
      />
    </div>
  );
}

// ---------- Node form modal ----------
export function NodeForm({
  node,
  orderMax,
  isRoot,
  onClose,
  onSave,
}: {
  node: TreeNode | null;
  orderMax: number;
  isRoot: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    link: string;
    notes: string;
    manual_progress: number | null;
    order_index: number;
  }) => void;
}) {
  const [name, setName] = useState(node?.name ?? '');
  const [link, setLink] = useState(node?.link ?? '');
  const [notes, setNotes] = useState(node?.notes ?? '');
  const [progress, setProgress] = useState<string>(
    node?.manual_progress !== null && node?.manual_progress !== undefined
      ? String(node.manual_progress)
      : '',
  );
  const [order, setOrder] = useState(node?.order_index ?? orderMax + 1);

  const title = isRoot
    ? node
      ? 'تعديل الكورس'
      : 'إضافة كورس جديد'
    : node
      ? 'تعديل العنوان الفرعي'
      : 'إضافة عنوان فرعي';

  return (
    <Modal open onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <label className="label">{isRoot ? 'اسم الكورس' : 'العنوان'}</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRoot ? 'مثال: دورة تعلم اللغة الإنجليزية' : 'العنوان الفرعي'}
            autoFocus
          />
        </div>
        <div>
          <label className="label">الرابط (اختياري)</label>
          <input
            className="input"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            dir="ltr"
          />
        </div>
        <div>
          <label className="label">ملاحظات (اختياري)</label>
          <textarea
            className="input min-h-[72px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظاتك..."
          />
        </div>
        <div>
          <label className="label">
            نسبة الإنجاز (اختياري — اتركه فارغًا للحساب التلقائي)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              className="input w-28 text-center"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="تلقائي"
            />
            <span className="text-sm text-slate-400">%</span>
            {progress !== '' && (
              <button
                onClick={() => setProgress('')}
                className="btn-ghost text-xs"
              >
                تلقائي
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            مثال: 10%، 20%، 100% — يمكنك تعديلها في أي وقت
          </p>
        </div>
        <div>
          <label className="label">الترتيب</label>
          <input
            type="number"
            min={1}
            className="input"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-outline flex-1">
            إلغاء
          </button>
          <button
            onClick={() =>
              onSave({
                name: name.trim(),
                link: link.trim(),
                notes: notes.trim(),
                manual_progress:
                  progress !== '' && !isNaN(Number(progress))
                    ? Math.max(0, Math.min(100, Number(progress)))
                    : null,
                order_index: order,
              })
            }
            disabled={!name.trim()}
            className="btn-primary flex-1"
          >
            حفظ
          </button>
        </div>
      </div>
    </Modal>
  );
}

