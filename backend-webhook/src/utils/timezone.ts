import moment from 'moment-timezone';

export function getBrazilTime(): Date {
  return moment().tz('America/Sao_Paulo').toDate();
}

export function formatBrazilTime(date: Date): string {
  return moment(date).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
}