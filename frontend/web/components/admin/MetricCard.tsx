'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface MetricCardProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  children?: ReactNode;
  className?: string;
}

/**
 * Wrapper reutilizable para metricas con loading/error/data states.
 * Mantiene altura consistente con skeleton mientras carga.
 */
export function MetricCard({ title, description, loading, error, children, className }: MetricCardProps) {
  return (
    <Card className={`bg-white border-[#e5e5e5] shadow-sm ${className ?? ''}`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-[#1a1a1a] text-lg">{title}</CardTitle>}
          {description && <CardDescription className="text-[#737373]">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm py-4">
            <AlertCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}