import { useCallback, useEffect, useState } from 'react';
import type { Settings, TreeNode } from '@/types';
import { DEFAULT_SETTINGS, nodesRepo, settingsRepo } from '@/lib/db';

export interface DataState {
  nodes: TreeNode[];
  settings: Settings;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useData(): DataState {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [n, st] = await Promise.all([nodesRepo.all(), settingsRepo.get()]);
    setNodes(n);
    setSettings(st);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { nodes, settings, loading, reload };
}

// ---------- Tree helpers ----------
export interface TreeItem extends TreeNode {
  children: TreeItem[];
}

export function buildTree(nodes: TreeNode[]): TreeItem[] {
  const map = new Map<string, TreeItem>();
  for (const n of nodes) map.set(n.id, { ...n, children: [] });
  const roots: TreeItem[] = [];
  for (const item of map.values()) {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(item);
    } else {
      roots.push(item);
    }
  }
  const sortRec = (items: TreeItem[]) => {
    items.sort((a, b) => a.order_index - b.order_index);
    items.forEach((i) => sortRec(i.children));
  };
  sortRec(roots);
  return roots;
}

export function childrenOf(nodes: TreeNode[], parentId: string | null): TreeNode[] {
  return nodes
    .filter((n) => n.parent_id === parentId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function descendantsOf(
  nodes: TreeNode[],
  id: string,
): TreeNode[] {
  const result: TreeNode[] = [];
  const collect = (pid: string) => {
    for (const n of nodes) {
      if (n.parent_id === pid) {
        result.push(n);
        collect(n.id);
      }
    }
  };
  collect(id);
  return result;
}

export interface ProgressInfo {
  total: number;
  completed: number;
  percent: number;
}

export function nodeProgress(
  nodes: TreeNode[],
  nodeId: string,
): ProgressInfo {
  const node = nodes.find((n) => n.id === nodeId);
  const desc = descendantsOf(nodes, nodeId);

  // If user set a manual progress, use it directly
  if (node && node.manual_progress !== null && node.manual_progress !== undefined) {
    return {
      total: desc.length,
      completed: desc.filter((d) => d.is_completed).length,
      percent: Math.max(0, Math.min(100, node.manual_progress)),
    };
  }

  // No children — derive from completion
  if (desc.length === 0) {
    const pct = node?.is_completed ? 100 : 0;
    return { total: 0, completed: 0, percent: pct };
  }

  // Auto-calculate from descendants
  const total = desc.length;
  const completed = desc.filter((d) => d.is_completed).length;
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function overallProgress(nodes: TreeNode[]): ProgressInfo {
  const total = nodes.length;
  const completed = nodes.filter((n) => n.is_completed).length;
  // Average of all root nodes' manual or auto progress
  const roots = nodes.filter((n) => n.parent_id === null);
  if (roots.length === 0) {
    return { total, completed, percent: 0 };
  }
  const rootPercents = roots.map((r) => nodeProgress(nodes, r.id).percent);
  const avg = Math.round(rootPercents.reduce((a, b) => a + b, 0) / roots.length);
  return { total, completed, percent: avg };
}

export function pathOf(nodes: TreeNode[], id: string): TreeNode[] {
  const map = new Map(nodes.map((n) => [n.id, n]));
  const path: TreeNode[] = [];
  let cur = map.get(id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parent_id ? map.get(cur.parent_id) : undefined;
  }
  return path;
}
