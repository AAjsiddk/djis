import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Plus, TrendingUp } from 'lucide-react';
import type { Page, SortMode, TreeNode } from '@/types';
import {
  buildTree,
  childrenOf,
  TreeItem,
} from '@/lib/useData';
import { deleteNodeCascade, nodesRepo, uid } from '@/lib/db';
import { NodeForm, TreeRow } from '@/components/TreeRow';

interface CoursesPageProps {
  nodes: TreeNode[];
  sortMode: SortMode;
  onNavigate: (p: Page) => void;
  reload: () => Promise<void>;
}

function sortRoots(roots: TreeItem[], mode: SortMode): TreeItem[] {
  if (mode === 'importance') return roots; // already by order_index
  if (mode === 'created')
    return [...roots].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  return [...roots].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

export function CoursesPage({ nodes, sortMode, onNavigate, reload }: CoursesPageProps) {
  const tree = useMemo(() => buildTree(nodes), [nodes]);
  const sortedRoots = useMemo(() => sortRoots(tree, sortMode), [tree, sortMode]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<{
    open: boolean;
    node: TreeNode | null;
    parentId: string | null;
    isRoot: boolean;
  }>({ open: false, node: null, parentId: null, isRoot: false });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set(nodes.map((n) => n.id));
    setExpanded(all);
  };

  const collapseAll = () => setExpanded(new Set());

  const openAddRoot = () =>
    setFormState({
      open: true,
      node: null,
      parentId: null,
      isRoot: true,
    });

  const openAddChild = (parentId: string) =>
    setFormState({
      open: true,
      node: null,
      parentId,
      isRoot: false,
    });

  const openEdit = (node: TreeNode) =>
    setFormState({
      open: true,
      node,
      parentId: node.parent_id,
      isRoot: node.parent_id === null,
    });

  const closeForm = () =>
    setFormState((s) => ({ ...s, open: false }));

  const handleSave = async (data: {
    name: string;
    link: string;
    notes: string;
    manual_progress: number | null;
    order_index: number;
  }) => {
    if (formState.node) {
      await nodesRepo.put({
        ...formState.node,
        name: data.name,
        link: data.link,
        notes: data.notes,
        manual_progress: data.manual_progress,
        order_index: data.order_index,
      });
    } else {
      const newNode: TreeNode = {
        id: uid(),
        parent_id: formState.parentId,
        name: data.name,
        link: data.link,
        notes: data.notes,
        is_completed: false,
        manual_progress: data.manual_progress,
        order_index: data.order_index,
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      await nodesRepo.put(newNode);
      if (formState.parentId) {
        setExpanded((prev) => new Set(prev).add(formState.parentId!));
      }
    }
    await reload();
    closeForm();
  };

  const handleDelete = async (node: TreeNode) => {
    await deleteNodeCascade(node.id, nodes);
    await reload();
  };

  const handleMove = async (node: TreeNode, dir: -1 | 1) => {
    const siblings = childrenOf(nodes, node.parent_id);
    const idx = siblings.findIndex((s) => s.id === node.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const other = siblings[swapIdx];
    await nodesRepo.put({ ...node, order_index: other.order_index });
    await nodesRepo.put({ ...other, order_index: node.order_index });
    await reload();
  };

  const handleToggleComplete = async (node: TreeNode) => {
    await nodesRepo.put({
      ...node,
      is_completed: !node.is_completed,
      completed_at: !node.is_completed ? new Date().toISOString() : null,
    });
    await reload();
  };

  const orderMax = childrenOf(nodes, formState.parentId).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary-500" size={26} />
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            الكورسات
          </h1>
        </div>
        <button onClick={openAddRoot} className="btn-primary">
          <Plus size={18} />
          إضافة كورس جديد
        </button>
      </div>

      {/* Expand/collapse controls */}
      {sortedRoots.length > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="btn-ghost text-xs">
            <ChevronDown size={16} />
            توسيع الكل
          </button>
          <button onClick={collapseAll} className="btn-ghost text-xs">
            <ChevronLeft size={16} />
            طي الكل
          </button>
        </div>
      )}

      {/* Tree */}
      {sortedRoots.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-400 dark:bg-primary-900/30">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            لا توجد كورسات بعد
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ابدأ رحلتك بإضافة أول كورس — يمكنك إضافة عناوين فرعية بلا حدود تحته
          </p>
          <button onClick={openAddRoot} className="btn-primary mt-2">
            <Plus size={18} />
            إضافة كورس
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRoots.map((root) => (
            <TreeRow
              key={root.id}
              node={root}
              depth={0}
              siblings={sortedRoots}
              allNodes={nodes}
              expanded={expanded}
              onToggle={toggleExpand}
              onAddChild={openAddChild}
              onEdit={openEdit}
              onDelete={handleDelete}
              onMove={handleMove}
              onToggleComplete={handleToggleComplete}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {/* Node form */}
      {formState.open && (
        <NodeForm
          node={formState.node}
          parentId={formState.parentId}
          orderMax={orderMax}
          isRoot={formState.isRoot}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
