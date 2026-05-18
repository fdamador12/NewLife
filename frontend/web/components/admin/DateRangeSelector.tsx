'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  /** Días hacia atrás desde hoy. null = todo el historial. */
  days: number | null;
  onChange: (days: number | null) => void;
}

const OPTIONS: Array<{ days: number | null; label: string }> = [
  { days: 7, label: 'Últimos 7 días' },
  { days: 30, label: 'Últimos 30 días' },
  { days: 90, label: 'Últimos 90 días' },
  { days: null, label: 'Todo' },
];

export function DateRangeSelector({ days, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="w-4 h-4 text-[#737373]" />
      <span className="text-sm text-[#737373]">Rango:</span>
      <div className="flex gap-1 flex-wrap">
        {OPTIONS.map((opt) => (
          <Button
            key={opt.label}
            variant={days === opt.days ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(opt.days)}
            className={
              days === opt.days
                ? 'bg-[#d4854a] hover:bg-[#c07842] text-white border-[#d4854a]'
                : 'bg-white border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#f8f6f3]'
            }
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Calcula el rango from/to a partir de cantidad de dias hacia atras.
 * Si days es null, devuelve un rango vacio (todo el historial).
 */
export function calculateDateRange(days: number | null): { from?: string; to?: string } {
  if (days === null) return {};
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}