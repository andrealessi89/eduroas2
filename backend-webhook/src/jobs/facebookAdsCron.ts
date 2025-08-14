import cron from 'node-cron';
import { FacebookAdsService } from '../services/facebookAdsService';

export function initializeFacebookAdsCron() {
  // Executar a cada hora (minuto 0)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Iniciando coleta de dados do Facebook Ads (apenas para usuários sem Google Ads)...');
    
    try {
      await FacebookAdsService.fetchUsersWithoutGoogleAds();
      console.log('[CRON] Coleta de dados do Facebook Ads concluída com sucesso');
    } catch (error) {
      console.error('[CRON] Erro na coleta de dados do Facebook Ads:', error);
    }
  });

  console.log('[CRON] Job do Facebook Ads agendado para executar a cada hora (apenas usuários sem Google Ads)');

  // Executar uma vez ao iniciar para pegar dados do dia
  FacebookAdsService.fetchUsersWithoutGoogleAds()
    .then(() => console.log('[CRON] Coleta inicial do Facebook Ads concluída'))
    .catch(error => console.error('[CRON] Erro na coleta inicial do Facebook Ads:', error));
}