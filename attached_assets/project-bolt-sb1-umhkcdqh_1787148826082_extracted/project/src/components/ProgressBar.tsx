interface ProgressBarProps {
  percent: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  percent,
  className = '',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  let barColor = 'bg-gold-500';
  if (clamped === 100) barColor = 'bg-emerald-500';
  else if (clamped >= 60) barColor = 'bg-primary-500';

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>نسبة الإنجاز</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className={`relative w-full overflow-hidden rounded-full bg-slate-200 ${height} dark:bg-slate-700`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
