// analysis/utils/dateUtils.ts

export class DateUtils {
  static getLastNDays(n: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - n);
    return { start, end };
  }

  static getThisWeek(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    return { start, end };
  }

  static getLastWeek(): { start: Date; end: Date } {
    const end = new Date();
    end.setDate(end.getDate() - end.getDay());
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { start, end };
  }

  static getThisMonth(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { start, end };
  }

  static getLastMonth(): { start: Date; end: Date } {
    const end = new Date();
    end.setDate(0); // Último día del mes anterior
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { start, end };
  }

  static getPeriod(type: 'week' | 'month'): { current: { start: Date; end: Date }; previous: { start: Date; end: Date } } {
    if (type === 'week') {
      return {
        current: this.getThisWeek(),
        previous: this.getLastWeek(),
      };
    }
    return {
      current: this.getThisMonth(),
      previous: this.getLastMonth(),
    };
  }

  static isInRange(date: string, start: Date, end: Date): boolean {
    const checkDate = new Date(date);
    return checkDate >= start && checkDate <= end;
  }

  static getUniqueDates(records: any[]): string[] {
    const uniqueDates = new Set(records.map(r => r.fecha));
    return Array.from(uniqueDates).sort();
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  static formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
    });
  }

  static getDayOfWeek(date: string): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[new Date(date).getDay()];
  }

  static hoursBetween(date1: string, date2: string): number {
    return Math.abs(new Date(date2).getTime() - new Date(date1).getTime()) / (1000 * 60 * 60);
  }
}