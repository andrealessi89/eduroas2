"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFacebookAdsCron = initializeFacebookAdsCron;
const node_cron_1 = __importDefault(require("node-cron"));
const facebookAdsService_1 = require("../services/facebookAdsService");
function initializeFacebookAdsCron() {
    // Executar a cada hora (minuto 0)
    node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('[CRON] Iniciando coleta de dados do Facebook Ads...');
        try {
            await facebookAdsService_1.FacebookAdsService.fetchAllUsersInsights();
            console.log('[CRON] Coleta de dados do Facebook Ads concluída com sucesso');
        }
        catch (error) {
            console.error('[CRON] Erro na coleta de dados do Facebook Ads:', error);
        }
    });
    console.log('[CRON] Job do Facebook Ads agendado para executar a cada hora');
    // Executar uma vez ao iniciar para pegar dados do dia
    facebookAdsService_1.FacebookAdsService.fetchAllUsersInsights()
        .then(() => console.log('[CRON] Coleta inicial do Facebook Ads concluída'))
        .catch(error => console.error('[CRON] Erro na coleta inicial do Facebook Ads:', error));
}
