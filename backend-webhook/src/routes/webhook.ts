import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import { getBrazilTime } from '../utils/timezone';

const router = Router();

interface GoogleAdsPayload {
  date: string;
  accountId: string;
  accountName: string;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  averageCpc: number;
  conversionValue: number;
}

router.post('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const payload: GoogleAdsPayload = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const requiredFields = [
      'date', 'accountId', 'accountName', 'cost', 
      'impressions', 'clicks', 'conversions', 
      'averageCpc', 'conversionValue'
    ];
    
    for (const field of requiredFields) {
      if (payload[field as keyof GoogleAdsPayload] === undefined) {
        return res.status(400).json({ 
          error: `Campo obrigatório ausente: ${field}` 
        });
      }
    }

    const googleAdsData = await prisma.googleAdsData.create({
      data: {
        userId: req.user.id,
        date: payload.date,
        accountId: payload.accountId,
        accountName: payload.accountName,
        cost: payload.cost,
        impressions: payload.impressions,
        clicks: payload.clicks,
        conversions: payload.conversions,
        averageCpc: payload.averageCpc,
        conversionValue: payload.conversionValue,
        receivedAt: getBrazilTime()
      }
    });

    console.log(`✅ Dados recebidos do Google Ads para usuário ${req.user.email}:`, {
      accountId: payload.accountId,
      date: payload.date,
      receivedAt: googleAdsData.receivedAt
    });

    res.status(201).json({
      success: true,
      message: 'Dados recebidos com sucesso',
      id: googleAdsData.id,
      receivedAt: googleAdsData.receivedAt
    });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ 
      error: 'Erro ao processar dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

router.get('/test', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  res.json({
    success: true,
    message: 'Webhook endpoint funcionando',
    user: req.user,
    timestamp: getBrazilTime()
  });
});

export default router;