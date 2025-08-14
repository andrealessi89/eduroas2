import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { getBrazilTime } from '../utils/timezone';

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
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  action_values?: Array<{
    action_type: string;
    value: string;
  }>;
}

export class FacebookAdsService {
  static async fetchAndSaveInsights(userId: string, date?: string) {
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
        const config = integracao.config as any;
        
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
            const response = await axios.get(
              `https://graph.facebook.com/v23.0/${accountId}/insights`,
              {
                params: {
                  fields: 'account_name,spend,impressions,clicks,cpc,ctr,reach,frequency,actions,action_values',
                  time_range: JSON.stringify({
                    since: targetDate,
                    until: targetDate
                  }),
                  level: 'account',
                  action_breakdowns: 'action_type',
                  access_token: config.accessToken
                }
              }
            );

            if (response.data && response.data.data && response.data.data.length > 0) {
              const insights: FacebookAdsInsight = response.data.data[0];
              console.log(`[FacebookAds] Insights recebidos para conta ${accountId}:`, JSON.stringify(insights, null, 2));
              
              // Extrair conversões (purchases) das actions - apenas offsite_conversion.fb_pixel_purchase
              let conversions = 0;
              if (insights.actions) {
                for (const action of insights.actions) {
                  if (action.action_type === 'offsite_conversion.fb_pixel_purchase') {
                    conversions += parseInt(action.value || '0');
                  }
                }
              }
              
              // Extrair valor de conversão dos action_values - apenas offsite_conversion.fb_pixel_purchase
              let conversionValue = 0;
              if (insights.action_values) {
                for (const actionValue of insights.action_values) {
                  if (actionValue.action_type === 'offsite_conversion.fb_pixel_purchase') {
                    conversionValue += parseFloat(actionValue.value || '0');
                  }
                }
              }
              
              console.log(`[FacebookAds] Total de conversões (purchases) encontradas: ${conversions}`);
              console.log(`[FacebookAds] Valor total de conversões: R$ ${conversionValue.toFixed(2)}`);
              
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
                conversions: conversions,
                averageCpc: parseFloat(insights.cpc || '0'),
                conversionValue: conversionValue
              };
              
              console.log(`[FacebookAds] Dados a salvar - spend original: "${insights.spend}", cost convertido: ${dataToSave.cost}`);

              if (existingData) {
                const updated = await prisma.facebookAdsData.update({
                  where: { id: existingData.id },
                  data: dataToSave
                });
                console.log(`[FacebookAds] Dados atualizados para conta ${accountId} - ${targetDate}`);
                console.log(`[FacebookAds] UpdatedAt: ${updated.updatedAt.toISOString()}`);
              } else {
                const created = await prisma.facebookAdsData.create({
                  data: dataToSave
                });
                console.log(`[FacebookAds] Novos dados criados para conta ${accountId} - ${targetDate}`);
                console.log(`[FacebookAds] ReceivedAt: ${created.receivedAt.toISOString()}`);
                console.log(`[FacebookAds] UpdatedAt: ${created.updatedAt.toISOString()}`);
              }
            } else {
              console.log(`[FacebookAds] Nenhum dado retornado para conta ${accountId} na data ${targetDate}`);
            }
          } catch (error: any) {
            console.error(`[FacebookAds] Erro ao buscar insights da conta ${accountId}:`, error.message);
            if (error.response) {
              console.error(`[FacebookAds] Resposta da API:`, error.response.data);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[FacebookAds] Erro ao processar insights:', error.message);
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

  static async fetchUserInsights(userId: string, date?: string) {
    try {
      await this.fetchAndSaveInsights(userId, date);
    } catch (error) {
      console.error(`Erro ao buscar insights do usuário ${userId}:`, error);
      throw error;
    }
  }

  static async fetchUsersWithoutGoogleAds(date?: string) {
    try {
      // Buscar usuários com integrações Meta ativas mas SEM integrações Google ativas
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              integracoes: {
                some: {
                  tipo: 'meta',
                  isActive: true
                }
              }
            },
            {
              OR: [
                {
                  integracoes: {
                    none: {
                      tipo: 'google'
                    }
                  }
                },
                {
                  integracoes: {
                    every: {
                      OR: [
                        { tipo: { not: 'google' } },
                        { isActive: false }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      });

      console.log(`[FacebookAds] Encontrados ${users.length} usuários com Meta mas sem Google Ads ativo`);

      for (const user of users) {
        console.log(`[FacebookAds] Sincronizando Facebook Ads para usuário ${user.email} (sem Google Ads)`);
        await this.fetchAndSaveInsights(user.id, date);
      }
    } catch (error) {
      console.error('Erro ao buscar insights de usuários sem Google Ads:', error);
      throw error;
    }
  }
}