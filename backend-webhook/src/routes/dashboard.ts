import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Rota principal do dashboard com todos os dados
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { startDate, endDate, platform } = req.query;

    const where: any = {
      userId: req.user!.id
    };

    const whereDate: any = {};
    if (startDate || endDate) {
      whereDate.date = {};
      if (startDate) whereDate.date.gte = startDate as string;
      if (endDate) whereDate.date.lte = endDate as string;
    }

    const wherePedidos: any = {
      userId: req.user!.id
    };

    if (startDate || endDate) {
      wherePedidos.createdAt = {};
      if (startDate) wherePedidos.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        wherePedidos.createdAt.lte = end;
      }
    }

    // Buscar dados conforme a plataforma selecionada
    const promises: Promise<any>[] = [];
    
    if (!platform || platform === 'all' || platform === 'google') {
      promises.push(
        prisma.googleAdsData.findMany({
          where: { ...where, ...whereDate },
          orderBy: { date: 'desc' }
        })
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    if (!platform || platform === 'all' || platform === 'facebook') {
      promises.push(
        prisma.facebookAdsData.findMany({
          where: { ...where, ...whereDate },
          orderBy: { date: 'desc' }
        })
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    promises.push(
      prisma.pedido.findMany({
        where: wherePedidos,
        include: { itens: true },
        orderBy: { createdAt: 'desc' }
      })
    );

    const [googleAdsData, facebookAdsData, pedidos] = await Promise.all(promises);

    // Calcular métricas do Google Ads
    const googleMetrics = googleAdsData.reduce((acc: any, record: any) => ({
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

    // Calcular métricas do Facebook Ads
    const facebookMetrics = facebookAdsData.reduce((acc: any, record: any) => ({
      cost: acc.cost + (record.cost || 0),
      impressions: acc.impressions + (record.impressions || 0),
      clicks: acc.clicks + (record.clicks || 0),
      conversions: acc.conversions + (record.conversions || 0),
      conversionValue: acc.conversionValue + (record.conversionValue || 0)
    }), {
      cost: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      conversionValue: 0
    });

    // Calcular métricas de pedidos e custos reais
    let custoProdutosTotal = 0;
    let valorProdutosTotal = 0;
    let valorDescontoTotal = 0;
    let pedidosAprovados = 0;

    const pedidosMetrics = pedidos.reduce((acc: any, pedido: any) => {
      // Calcular custo real dos produtos deste pedido
      let custoPedido = 0;
      for (const item of pedido.itens || []) {
        custoPedido += item.custoUnitario * item.quantidade;
      }

      custoProdutosTotal += custoPedido;
      valorProdutosTotal += pedido.valorProduto;
      valorDescontoTotal += pedido.valorDesconto;

      // Contar apenas pedidos aprovados (situação 4)
      if (pedido.situacao === 4) {
        pedidosAprovados++;
      }

      return {
        count: acc.count + 1,
        valorTotal: acc.valorTotal + pedido.valorTotal,
        valorFrete: acc.valorFrete + pedido.valorFrete,
        valorProduto: acc.valorProduto + pedido.valorProduto,
        valorDesconto: acc.valorDesconto + pedido.valorDesconto
      };
    }, {
      count: 0,
      valorTotal: 0,
      valorFrete: 0,
      valorProduto: 0,
      valorDesconto: 0
    });

    // Investimento total em anúncios
    const investimentoTotal = googleMetrics.cost + facebookMetrics.cost;

    // Vendas totais
    const vendasTotais = pedidosMetrics.valorTotal;

    // ROAS (Return on Ad Spend)
    const roasGoogle = googleMetrics.cost > 0 ? googleMetrics.conversionValue / googleMetrics.cost : 0;
    const roasFacebook = facebookMetrics.cost > 0 ? facebookMetrics.conversionValue / facebookMetrics.cost : 0;
    const roasGeral = investimentoTotal > 0 ? vendasTotais / investimentoTotal : 0;

    // Lucro líquido (receita - custos - investimento)
    const lucroLiquido = vendasTotais - custoProdutosTotal - pedidosMetrics.valorFrete - investimentoTotal;

    // Métricas de performance
    const cpcGoogle = googleMetrics.clicks > 0 ? googleMetrics.cost / googleMetrics.clicks : 0;
    const cpcFacebook = facebookMetrics.clicks > 0 ? facebookMetrics.cost / facebookMetrics.clicks : 0;

    const cpaGoogle = googleMetrics.conversions > 0 ? googleMetrics.cost / googleMetrics.conversions : 0;
    const cpaFacebook = facebookMetrics.conversions > 0 ? facebookMetrics.cost / facebookMetrics.conversions : 0;

    // Taxa de conversão
    const taxaConversaoGoogle = googleMetrics.clicks > 0 ? (googleMetrics.conversions / googleMetrics.clicks) * 100 : 0;
    const taxaConversaoFacebook = facebookMetrics.clicks > 0 ? (facebookMetrics.conversions / facebookMetrics.clicks) * 100 : 0;

    // Preparar dados para gráficos de evolução
    const evolutionData = prepareEvolutionData(googleAdsData, facebookAdsData);

    return res.json({
      success: true,
      data: {
        // Métricas principais
        investimentoTotal,
        vendasTotais,
        lucroLiquido,
        roasGeral,
        
        // Métricas de pedidos
        pedidos: {
          count: pedidosMetrics.count,
          aprovados: pedidosAprovados,
          valorTotal: pedidosMetrics.valorTotal,
          valorProduto: pedidosMetrics.valorProduto,
          valorFrete: pedidosMetrics.valorFrete,
          valorDesconto: pedidosMetrics.valorDesconto,
          valorProdutos: pedidosMetrics.valorProduto - pedidosMetrics.valorDesconto,
          ticketMedio: pedidosMetrics.count > 0 ? pedidosMetrics.valorTotal / pedidosMetrics.count : 0
        },

        // Métricas por plataforma
        google: {
          investimento: googleMetrics.cost,
          vendas: googleMetrics.conversionValue,
          impressions: googleMetrics.impressions,
          clicks: googleMetrics.clicks,
          conversions: googleMetrics.conversions,
          roas: roasGoogle,
          cpc: cpcGoogle,
          cpa: cpaGoogle,
          taxaConversao: taxaConversaoGoogle
        },
        
        facebook: {
          investimento: facebookMetrics.cost,
          vendas: facebookMetrics.conversionValue,
          impressions: facebookMetrics.impressions,
          clicks: facebookMetrics.clicks,
          conversions: facebookMetrics.conversions,
          roas: roasFacebook,
          cpc: cpcFacebook,
          cpa: cpaFacebook,
          taxaConversao: taxaConversaoFacebook
        },

        // Dados para gráficos
        evolution: evolutionData,

        // Informações de custos
        custos: {
          produtos: custoProdutosTotal,
          frete: pedidosMetrics.valorFrete,
          anuncios: investimentoTotal,
          descontos: pedidosMetrics.valorDesconto,
          total: custoProdutosTotal + pedidosMetrics.valorFrete + investimentoTotal
        },

        // Distribuição de custos e lucro (para gráfico de pizza)
        distribuicao: {
          produtos: custoProdutosTotal,
          frete: pedidosMetrics.valorFrete,
          marketing: investimentoTotal,
          lucro: lucroLiquido > 0 ? lucroLiquido : 0
        },

        // Métricas de margem
        margem: {
          bruta: vendasTotais > 0 ? ((vendasTotais - custoProdutosTotal) / vendasTotais) * 100 : 0,
          liquida: vendasTotais > 0 ? (lucroLiquido / vendasTotais) * 100 : 0,
          contribuicao: vendasTotais > 0 ? ((vendasTotais - custoProdutosTotal - pedidosMetrics.valorFrete) / vendasTotais) * 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do dashboard'
    });
  }
});

// Função auxiliar para preparar dados de evolução
function prepareEvolutionData(googleData: any[], facebookData: any[]) {
  const dateMap = new Map();

  // Processar dados do Google
  googleData.forEach(record => {
    if (!dateMap.has(record.date)) {
      dateMap.set(record.date, { date: record.date, google: 0, facebook: 0 });
    }
    dateMap.get(record.date).google = record.conversionValue / record.cost;
  });

  // Processar dados do Facebook
  facebookData.forEach(record => {
    if (!dateMap.has(record.date)) {
      dateMap.set(record.date, { date: record.date, google: 0, facebook: 0 });
    }
    dateMap.get(record.date).facebook = record.conversionValue / record.cost;
  });

  // Converter para array e ordenar por data
  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Rota para métricas resumidas (para widgets)
router.get('/summary', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar dados de hoje
    const [googleToday, facebookToday, pedidosToday] = await Promise.all([
      prisma.googleAdsData.findMany({
        where: {
          userId: req.user!.id,
          date: today
        }
      }),
      prisma.facebookAdsData.findMany({
        where: {
          userId: req.user!.id,
          date: today
        }
      }),
      prisma.pedido.count({
        where: {
          userId: req.user!.id,
          createdAt: {
            gte: new Date(today),
            lte: new Date(today + 'T23:59:59.999Z')
          }
        }
      })
    ]);

    const googleCostToday = googleToday.reduce((sum, r) => sum + r.cost, 0);
    const facebookCostToday = facebookToday.reduce((sum, r) => sum + r.cost, 0);

    return res.json({
      success: true,
      data: {
        today: {
          investimento: googleCostToday + facebookCostToday,
          pedidos: pedidosToday,
          google: googleCostToday,
          facebook: facebookCostToday
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar resumo'
    });
  }
});

export default router;