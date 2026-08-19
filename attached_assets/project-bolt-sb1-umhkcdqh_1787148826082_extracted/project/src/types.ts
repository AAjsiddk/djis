export interface TreeNode {
  id: string;
  parent_id: string | null; // null = root (course)
  name: string;
  link: string;
  notes: string;
  is_completed: boolean;
  manual_progress: number | null; // 0-100, user-set; null = auto from children
  order_index: number;
  created_at: string;
  completed_at: string | null;
}

export type SortMode = 'importance' | 'created' | 'alphabetical';

export interface Settings {
  id: 'app';
  default_sort: SortMode;
  reminder_enabled: boolean;
  reminder_days: number;
  dark_mode: 'auto' | 'light' | 'dark';
}

export interface BackupData {
  version: number;
  exported_at: string;
  nodes: TreeNode[];
  settings: Settings;
}

export type Page =
  | { name: 'dashboard' }
  | { name: 'courses' }
  | { name: 'search' }
  | { name: 'settings' }
  | { name: 'backup' };

export interface SearchResult {
  id: string;
  name: string;
  path: string;
  is_completed: boolean;
}
