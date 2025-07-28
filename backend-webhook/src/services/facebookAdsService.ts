import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface FacebookAdsInsight {
  account_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  cpc: string;
  ctr: string;
  reach: string;
  frequency: string;
  date_start: string;
  date_stop: string;
}

export class FacebookAdsService {
  static async fetchAndSaveInsights(userId: string, date?: string) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Buscar integrações Meta do usuário com contas selecionadas
      const integracoes = await prisma.integracao.findMany({
        where: {
          userId,
          tipo: 'meta',
          isActive: true
        }
      });

      for (const integracao of integracoes) {
        const config = integracao.config as any;
        
        if (!config.accessToken || !config.selectedAccounts || config.selectedAccounts.length === 0) {
          continue;
        }

        // Para cada conta selecionada, buscar insights
        for (const accountId of config.selectedAccounts) {
          try {
            const response = await axios.get(
              `https://graph.facebook.com/v23.0/${accountId}/insights`,
              {
                params: {
                  fields: 'account_name,spend,impressions,clicks,cpc,ctr,reach,frequency',
                  time_range: JSON.stringify({
                    since: targetDate,
                    until: targetDate
                  }),
                  access_token: config.accessToken
                }
              }
            );

            if (response.data && response.data.data && response.data.data.length > 0) {
              const insights: FacebookAdsInsight = response.data.data[0];
              
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

              if (existingData) {
                await prisma.facebookAdsData.update({
                  where: { id: existingData.id },
                  data: dataToSave
                });
              } else {
                await prisma.facebookAdsData.create({
                  data: dataToSave
                });
              }

              console.log(`Dados do Facebook Ads salvos para conta ${accountId} - ${targetDate}`);
            }
          } catch (error) {
            console.error(`Erro ao buscar insights da conta ${accountId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar insights do Facebook Ads:', error);
      throw error;
    }
  }

  static async fetchAllUsersInsights(date?: string) {
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
    } catch (error) {
      console.error('Erro ao buscar insights de todos os usuários:', error);
      throw error;
    }
  }
}