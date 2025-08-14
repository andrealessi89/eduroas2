import moment from 'moment-timezone';

// Timezone do Brasil
const BRAZIL_TZ = 'America/Sao_Paulo';

/**
 * Converte uma string de data para Date considerando o timezone do Brasil
 * @param dateStr String de data (YYYY-MM-DD ou ISO string)
 * @returns Date object
 */
export function parseBrazilDate(dateStr: string): Date {
  // Se for apenas data (YYYY-MM-DD), considerar início do dia no Brasil
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return moment.tz(dateStr, BRAZIL_TZ).startOf('day').toDate();
  }
  
  // Se for ISO string completa, converter considerando timezone
  return moment.tz(dateStr, BRAZIL_TZ).toDate();
}

/**
 * Cria intervalo de datas para filtros considerando timezone do Brasil
 * @param startDate Data início (YYYY-MM-DD)
 * @param endDate Data fim (YYYY-MM-DD)
 * @returns Objeto com datas de início e fim ajustadas
 */
export function createDateRange(startDate?: string, endDate?: string) {
  const range: any = {};
  
  if (startDate) {
    range.gte = moment.tz(startDate, BRAZIL_TZ).startOf('day').toDate();
  }
  
  if (endDate) {
    range.lte = moment.tz(endDate, BRAZIL_TZ).endOf('day').toDate();
  }
  
  return Object.keys(range).length > 0 ? range : undefined;
}

/**
 * Formata uma data para exibição no timezone do Brasil
 * @param date Date object
 * @returns String formatada
 */
export function formatBrazilDate(date: Date): string {
  return moment(date).tz(BRAZIL_TZ).format('YYYY-MM-DD HH:mm:ss');
}