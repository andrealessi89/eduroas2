import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { FacebookAdsService } from '../services/facebookAdsService';

const router = Router();
const prisma = new PrismaClient();

// Listar dados do Facebook Ads
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;
    console.log(`[FacebookAds API] GET /facebook-ads - userId: ${req.user!.id}, startDate: ${startDate}, endDate: ${endDate}`);
    
    const where: any = {
      userId: req.user!.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate as string;
      if (endDate) where.date.lte = endDate as string;
    }

    const data = await prisma.facebookAdsData.findMany({
      where,
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`[FacebookAds API] Dados encontrados: ${data.length} registros`);
    if (data.length > 0) {
      console.log(`[FacebookAds API] Primeiro registro:`, JSON.stringify(data[0], null, 2));
      console.log(`[FacebookAds API] Campos do primeiro registro:`, Object.keys(data[0]));
      console.log(`[FacebookAds API] updatedAt presente?`, 'updatedAt' in data[0]);
      console.log(`[FacebookAds API] Valor de updatedAt:`, data[0].updatedAt);
    }

    // Calcular métricas totais
    const totals = data.reduce((acc, record) => ({
      cost: acc.cost + record.cost,
      impressions: acc.impressions + record.impressions,
      clicks: acc.clicks + record.clicks,
      conversions: acc.conversions + record.conversions,
      conversionValue: acc.conversionValue + record.conversionValue
    }), {
      cost: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      conversionValue: 0
    });

    const metrics = {
      cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
      cpa: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
      roas: totals.cost > 0 ? totals.conversionValue / totals.cost : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    };
    
    console.log(`[FacebookAds API] Totals calculados:`, JSON.stringify(totals, null, 2));

    // Garantir que os campos de data sejam serializados corretamente
    const serializedData = data.map(item => ({
      ...item,
      receivedAt: item.receivedAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    return res.json({
      success: true,
      data: serializedData,
      totals,
      metrics
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Facebook Ads:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados'
    });
  }
});

// Buscar dados agregados
router.get('/aggregated/:period', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { period } = req.params;
    const { startDate, endDate } = req.query;
    
    const where: any = {
      userId: req.user!.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate as string;
      if (endDate) where.date.lte = endDate as string;
    }

    const data = await prisma.facebookAdsData.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    // Agrupar dados por período
    const aggregated = new Map<string, any>();
    
    data.forEach(record => {
      let key = record.date;
      
      if (period === 'week') {
        // Agrupar por semana
        const date = new Date(record.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'month') {
        // Agrupar por mês
        key = record.date.substring(0, 7);
      }

      if (!aggregated.has(key)) {
        aggregated.set(key, {
          period: key,
          cost: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversionValue: 0
        });
      }

      const agg = aggregated.get(key);
      agg.cost += record.cost;
      agg.impressions += record.impressions;
      agg.clicks += record.clicks;
      agg.conversions += record.conversions;
      agg.conversionValue += record.conversionValue;
    });

    // Calcular métricas derivadas
    const result = Array.from(aggregated.values()).map(agg => ({
      ...agg,
      ctr: agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0,
      conversionRate: agg.clicks > 0 ? (agg.conversions / agg.clicks) * 100 : 0
    }));

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar dados agregados:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados agregados'
    });
  }
});

// Buscar dados por ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;

    const data = await prisma.facebookAdsData.findUnique({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar registro'
    });
  }
});

// Webhook para processar dados do Facebook Ads
router.post('/webhook', async (req, res): Promise<any> => {
  try {
    console.log('[FacebookAds Webhook] Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    // Facebook envia verificação de webhook
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token']) {
      console.log('[FacebookAds Webhook] Verificação de webhook solicitada');
      return res.send(req.query['hub.challenge']);
    }

    // Processar dados do webhook
    // Por enquanto, vamos apenas buscar dados de todos os usuários
    await FacebookAdsService.fetchAllUsersInsights();

    return res.json({ success: true });
  } catch (error: any) {
    console.error('[FacebookAds Webhook] Erro ao processar:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar webhook'
    });
  }
});

// Forçar sincronização manual
router.post('/sync', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { date } = req.body;
    const userId = req.user!.id;
    
    console.log(`[FacebookAds API] Sincronização solicitada pelo usuário ${userId}`);
    console.log(`[FacebookAds API] Data solicitada: ${date || 'hoje'}`); 
    
    await FacebookAdsService.fetchAndSaveInsights(userId, date);

    return res.json({
      success: true,
      message: 'Sincronização iniciada com sucesso'
    });
  } catch (error: any) {
    console.error('[FacebookAds API] Erro ao sincronizar:', error.message);
    console.error('[FacebookAds API] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Erro ao sincronizar dados'
    });
  }
});

// Deletar registro
router.delete('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;

    const data = await prisma.facebookAdsData.deleteMany({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (data.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Registro excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao excluir registro'
    });
  }
});

export default router;