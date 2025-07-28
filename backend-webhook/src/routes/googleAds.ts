import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar dados do Google Ads
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { startDate, endDate, accountId, limit = 100, offset = 0 } = req.query;

    const where: any = {
      userId: req.user!.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate as string;
      if (endDate) where.date.lte = endDate as string;
    }

    if (accountId) {
      where.accountId = accountId as string;
    }

    const [googleAdsData, total] = await Promise.all([
      prisma.googleAdsData.findMany({
        where,
        orderBy: {
          receivedAt: 'desc'
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.googleAdsData.count({ where })
    ]);

    // Calcular totais
    const totals = await prisma.googleAdsData.aggregate({
      where,
      _sum: {
        cost: true,
        impressions: true,
        clicks: true,
        conversions: true,
        conversionValue: true
      },
      _avg: {
        averageCpc: true
      },
      _count: {
        id: true
      }
    });

    // Calcular métricas agregadas
    const metrics = {
      totalCost: totals._sum.cost || 0,
      totalImpressions: totals._sum.impressions || 0,
      totalClicks: totals._sum.clicks || 0,
      totalConversions: totals._sum.conversions || 0,
      totalConversionValue: totals._sum.conversionValue || 0,
      averageCpc: totals._avg.averageCpc || 0,
      count: totals._count.id,
      ctr: totals._sum.impressions ? (totals._sum.clicks! / totals._sum.impressions) * 100 : 0,
      conversionRate: totals._sum.clicks ? (totals._sum.conversions! / totals._sum.clicks) * 100 : 0,
      roas: totals._sum.cost ? totals._sum.conversionValue! / totals._sum.cost : 0,
      cpa: totals._sum.conversions ? totals._sum.cost! / totals._sum.conversions : 0
    };

    return res.json({
      success: true,
      data: googleAdsData,
      total,
      metrics
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Google Ads:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do Google Ads'
    });
  }
});

// Buscar dados por ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const data = await prisma.googleAdsData.findFirst({
      where: {
        id: req.params.id,
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

// Deletar registro (para fins administrativos)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const deleted = await prisma.googleAdsData.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Registro deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar registro'
    });
  }
});

// Buscar contas únicas
router.get('/accounts/list', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const accounts = await prisma.googleAdsData.findMany({
      where: {
        userId: req.user!.id
      },
      select: {
        accountId: true,
        accountName: true
      },
      distinct: ['accountId']
    });

    return res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar contas'
    });
  }
});

export default router;