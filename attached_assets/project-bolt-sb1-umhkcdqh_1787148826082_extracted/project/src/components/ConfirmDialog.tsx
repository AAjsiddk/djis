import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            danger
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
              : 'bg-gold-100 text-gold-600 dark:bg-gold-900/30'
          }`}
        >
          <AlertTriangle size={28} />
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {message}
        </p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="btn-outline flex-1">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
