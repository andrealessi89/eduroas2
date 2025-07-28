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
      orderBy: [
        { date: 'desc' },
        { accountName: 'asc' }
      ]
    });

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

    return res.json({
      success: true,
      data,
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
    console.log('Webhook Facebook Ads recebido:', JSON.stringify(req.body, null, 2));
    
    // Facebook envia verificação de webhook
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token']) {
      console.log('Verificação de webhook Facebook');
      return res.send(req.query['hub.challenge']);
    }

    // Processar dados do webhook
    // Por enquanto, vamos apenas buscar dados de todos os usuários
    await FacebookAdsService.fetchAllUsersInsights();

    return res.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook do Facebook Ads:', error);
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
    
    await FacebookAdsService.fetchAndSaveInsights(req.user!.id, date);

    return res.json({
      success: true,
      message: 'Sincronização iniciada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao sincronizar:', error);
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