'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventsList } from '@/hooks/useAnalytics';
import type { DateRangeFilter, EventCategory } from '@/lib/analytics';

interface EventsTableProps {
  dateRange?: DateRangeFilter;
}

const PAGE_SIZE = 20;

const CATEGORY_CHOICES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'session', label: 'Sesión' },
  { value: 'navigation', label: 'Navegación' },
  { value: 'crisis', label: 'Crisis' },
  { value: 'content', label: 'Contenido' },
  { value: 'care', label: 'Cuidado' },
  { value: 'gamification', label: 'Gamification' },
  { value: 'progress', label: 'Progreso' },
];

const CATEGORY_STYLES: Record<string, string> = {
  session: 'bg-blue-100 text-blue-700',
  navigation: 'bg-gray-100 text-gray-700',
  crisis: 'bg-red-100 text-red-700',
  content: 'bg-purple-100 text-purple-700',
  care: 'bg-pink-100 text-pink-700',
  gamification: 'bg-amber-100 text-amber-700',
  progress: 'bg-green-100 text-green-700',
};

/**
 * Formatea timestamp ISO a "DD/MM/YYYY HH:mm:ss"
 */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Renderiza el objeto properties como texto compacto.
 */
function formatProperties(props: Record<string, any> | null): string {
  if (!props || Object.keys(props).length === 0) return '—';
  return Object.entries(props)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join(' · ');
}

export function EventsTable({ dateRange }: EventsTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

  const filter = {
    ...dateRange,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    category: categoryFilter === 'all' ? undefined : (categoryFilter as EventCategory),
  };

  const { data, loading, error, reload } = useEventsList(filter);

  // Filtro por búsqueda en cliente (event_type, user_id_short, properties)
  const filteredItems = (data?.items ?? []).filter((event) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      event.event_type.toLowerCase().includes(q) ||
      event.user_id_short.toLowerCase().includes(q) ||
      JSON.stringify(event.properties ?? {}).toLowerCase().includes(q)
    );
  });

  const total = data?.pagination.total ?? 0;
  const hasMore = data?.pagination.has_more ?? false;
  const startItem = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min(total, page * PAGE_SIZE + (data?.items.length ?? 0));

  // Reset page al cambiar filtros
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(0);
  };

  return (
    <Card className="bg-white border-[#e5e5e5] shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#1a1a1a] text-lg">Registro de eventos</CardTitle>
        <CardDescription className="text-[#737373]">
          Actividad reciente en la app móvil (datos anonimizados). Total: {total} eventos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <Input
              placeholder="Buscar por tipo, usuario o detalles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a] placeholder:text-[#a3a3a3]"
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-56 bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_CHOICES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f6f3] hover:bg-[#f8f6f3]">
                <TableHead className="text-[#737373] font-semibold">Fecha y hora</TableHead>
                <TableHead className="text-[#737373] font-semibold">Usuario</TableHead>
                <TableHead className="text-[#737373] font-semibold">Tipo</TableHead>
                <TableHead className="text-[#737373] font-semibold">Categoría</TableHead>
                <TableHead className="text-[#737373] font-semibold">Propiedades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex items-center gap-2 text-red-600 text-sm py-4">
                      <AlertCircle className="w-4 h-4" />
                      <span>Error cargando eventos: {error}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-center py-8 text-[#737373]">
                      <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No se encontraron eventos</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((event) => (
                  <TableRow key={event.event_id} className="hover:bg-[#f8f6f3]/50">
                    <TableCell className="text-[#1a1a1a] font-mono text-xs whitespace-nowrap">
                      {formatTimestamp(event.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#737373]">
                      {event.user_id_short}
                    </TableCell>
                    <TableCell className="text-[#1a1a1a] font-medium text-sm">
                      {event.event_type}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${CATEGORY_STYLES[event.category] ?? 'bg-gray-100 text-gray-700'} font-medium`}
                      >
                        {event.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#737373] text-xs max-w-md truncate">
                      {formatProperties(event.properties)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-[#737373]">
              Mostrando {startItem}–{endItem} de {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}