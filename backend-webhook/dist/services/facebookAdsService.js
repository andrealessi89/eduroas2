"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookAdsService = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
class FacebookAdsService {
    static async fetchAndSaveInsights(userId, date) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            console.log(`[FacebookAds] Iniciando sincronização para usuário ${userId}, data: ${targetDate}`);
            // Buscar integrações Meta do usuário com contas selecionadas
            const integracoes = await prisma.integracao.findMany({
                where: {
                    userId,
                    tipo: 'meta',
                    isActive: true
                }
            });
            console.log(`[FacebookAds] Encontradas ${integracoes.length} integrações ativas`);
            for (const integracao of integracoes) {
                const config = integracao.config;
                if (!config.accessToken || !config.selectedAccounts || config.selectedAccounts.length === 0) {
                    console.log(`[FacebookAds] Integração ${integracao.id} ignorada - sem token ou contas selecionadas`);
                    continue;
                }
                console.log(`[FacebookAds] Processando integração ${integracao.id} com ${config.selectedAccounts.length} contas selecionadas`);
                console.log(`[FacebookAds] Contas: ${config.selectedAccounts.join(', ')}`);
                // Para cada conta selecionada, buscar insights
                for (const accountId of config.selectedAccounts) {
                    try {
                        console.log(`[FacebookAds] Buscando insights da conta ${accountId}`);
                        const response = await axios_1.default.get(`https://graph.facebook.com/v23.0/${accountId}/insights`, {
                            params: {
                                fields: 'account_name,spend,impressions,clicks,cpc,ctr,reach,frequency',
                                time_range: JSON.stringify({
                                    since: targetDate,
                                    until: targetDate
                                }),
                                access_token: config.accessToken
                            }
                        });
                        if (response.data && response.data.data && response.data.data.length > 0) {
                            const insights = response.data.data[0];
                            console.log(`[FacebookAds] Insights recebidos para conta ${accountId}:`, JSON.stringify(insights, null, 2));
                            // Verificar se já existe registro para esta data e conta
                            const existingData = await prisma.facebookAdsData.findFirst({
                                where: {
                                    userId,
                                    accountId,
                                    date: targetDate
                                }
                            });
                            const dataToSave = {
                                userId,
                                date: targetDate,
                                accountId,
                                accountName: insights.account_name,
                                cost: parseFloat(insights.spend || '0'),
                                impressions: parseInt(insights.impressions || '0'),
                                clicks: parseInt(insights.clicks || '0'),
                                conversions: 0, // Facebook não retorna conversões diretamente nesta API
                                averageCpc: parseFloat(insights.cpc || '0'),
                                conversionValue: 0 // Será calculado em outra chamada se necessário
                            };
                            console.log(`[FacebookAds] Dados a salvar - spend original: "${insights.spend}", cost convertido: ${dataToSave.cost}`);
                            if (existingData) {
                                await prisma.facebookAdsData.update({
                                    where: { id: existingData.id },
                                    data: dataToSave
                                });
                            }
                            else {
                                await prisma.facebookAdsData.create({
                                    data: dataToSave
                                });
                            }
                            console.log(`[FacebookAds] Dados salvos para conta ${accountId} - ${targetDate}`);
                        }
                        else {
                            console.log(`[FacebookAds] Nenhum dado retornado para conta ${accountId} na data ${targetDate}`);
                        }
                    }
                    catch (error) {
                        console.error(`[FacebookAds] Erro ao buscar insights da conta ${accountId}:`, error.message);
                        if (error.response) {
                            console.error(`[FacebookAds] Resposta da API:`, error.response.data);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('[FacebookAds] Erro ao processar insights:', error.message);
            throw error;
        }
    }
    static async fetchAllUsersInsights(date) {
        try {
            // Buscar todos os usuários com integrações Meta ativas
            const users = await prisma.user.findMany({
                where: {
                    integracoes: {
                        some: {
                            tipo: 'meta',
                            isActive: true
                        }
                    }
                }
            });
            for (const user of users) {
                await this.fetchAndSaveInsights(user.id, date);
            }
        }
        catch (error) {
            console.error('Erro ao buscar insights de todos os usuários:', error);
            throw error;
        }
    }
}
exports.FacebookAdsService = FacebookAdsService;
