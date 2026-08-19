import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${
            readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'
          }`}
          aria-label={`${star} نجوم`}
        >
          <Star
            size={size}
            className={
              star <= value
                ? 'fill-gold-400 text-gold-400'
                : 'fill-transparent text-slate-300 dark:text-slate-600'
            }
          />
        </button>
      ))}
    </div>
  );
}
