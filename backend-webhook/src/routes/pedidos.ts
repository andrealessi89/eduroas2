import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import moment from 'moment-timezone';

const router = Router();
const prisma = new PrismaClient();

interface PedidoPayload {
  idPedido: string;
  valorTotal: number;
  valorFrete: number;
}

// Listar pedidos do usuário com filtros
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where: any = {
      userId: req.user!.id
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.pedido.count({ where })
    ]);

    // Calcular totais
    const totals = await prisma.pedido.aggregate({
      where,
      _sum: {
        valorTotal: true,
        valorFrete: true
      },
      _count: {
        id: true
      }
    });

    return res.json({
      success: true,
      data: pedidos,
      total,
      totals: {
        count: totals._count.id,
        valorTotal: totals._sum.valorTotal || 0,
        valorFrete: totals._sum.valorFrete || 0,
        valorProdutos: (totals._sum.valorTotal || 0) - (totals._sum.valorFrete || 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar pedidos'
    });
  }
});

// Buscar pedido por ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const pedido = await prisma.pedido.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    return res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar pedido'
    });
  }
});

// Webhook para receber pedidos do e-commerce
router.post('/webhook/ecommerce', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const pedidoData = req.body;

    // Validar se é um pedido com situação 4 (aprovado)
    if (pedidoData.pedidoSituacao !== 4) {
      return res.status(200).json({
        success: true,
        message: 'Pedido ignorado - situação diferente de 4',
        situacao: pedidoData.pedidoSituacao
      });
    }

    // Verificar se o pedido já existe
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { codigo: pedidoData.codigo }
    });

    if (pedidoExistente) {
      return res.status(200).json({
        success: true,
        message: 'Pedido já processado anteriormente',
        codigo: pedidoData.codigo
      });
    }

    // Buscar o custo dos produtos
    const produtosSku = new Set<string>();
    for (const rastreio of pedidoData.arrayPedidoRastreio || []) {
      for (const item of rastreio.pedidoItem || []) {
        produtosSku.add(item.produtoDerivacaoCodigo);
      }
    }

    const produtos = await prisma.produto.findMany({
      where: {
        userId: req.user!.id,
        sku: { in: Array.from(produtosSku) }
      }
    });

    const produtosMap = new Map(produtos.map(p => [p.sku, p]));

    // Calcular valores totais
    let custoTotal = 0;
    const itensToCreate: any[] = [];

    for (const rastreio of pedidoData.arrayPedidoRastreio || []) {
      for (const item of rastreio.pedidoItem || []) {
        const produto = produtosMap.get(item.produtoDerivacaoCodigo);
        const custoUnitario = produto?.custo || 0;
        const lucroItem = item.valorItem - (custoUnitario * item.quantidade);
        
        custoTotal += custoUnitario * item.quantidade;

        itensToCreate.push({
          produtoDerivacaoId: item.produtoDerivacaoId,
          produtoDerivacaoCodigo: item.produtoDerivacaoCodigo,
          produtoNome: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: parseFloat(item.valorUnitario),
          valorDesconto: parseFloat(item.valorDesconto),
          valorItem: parseFloat(item.valorItem),
          custoUnitario,
          lucroItem
        });
      }
    }

    // Criar o pedido com seus itens
    const pedido = await prisma.pedido.create({
      data: {
        user: {
          connect: { id: req.user!.id }
        },
        idPedido: pedidoData.id.toString(),
        codigo: pedidoData.codigo,
        dataHora: new Date(pedidoData.dataHora),
        valorProduto: parseFloat(pedidoData.valorProduto),
        valorFrete: parseFloat(pedidoData.valorFrete),
        valorDesconto: parseFloat(pedidoData.valorDesconto),
        valorTotal: parseFloat(pedidoData.valorTotal),
        pessoaNome: pedidoData.pessoaNome,
        pessoaEmail: pedidoData.pessoaEmail || '',
        formaPagamento: pedidoData.formaPagamentoNome,
        situacao: pedidoData.pedidoSituacao,
        situacaoDescricao: pedidoData.pedidoSituacaoDescricao,
        cupomCodigo: pedidoData.cupomCodigo,
        cupomDesconto: pedidoData.cupomValorDesconto ? parseFloat(pedidoData.cupomValorDesconto) : 0,
        itens: {
          create: itensToCreate
        }
      },
      include: {
        itens: true
      }
    });

    const lucroTotal = pedido.valorTotal - custoTotal - pedido.valorFrete;

    const brasiliaTime = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
    console.log(`[${brasiliaTime}] Pedido aprovado recebido - User: ${req.user!.email} - Código: ${pedido.codigo} - Lucro: R$ ${lucroTotal.toFixed(2)}`);

    return res.status(200).json({
      success: true,
      message: 'Pedido processado com sucesso',
      data: {
        codigo: pedido.codigo,
        valorTotal: pedido.valorTotal,
        custoTotal,
        lucroTotal,
        itens: pedido.itens.length
      }
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook de pedido:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Erro ao processar pedido'
    });
  }
});

// Buscar estatísticas de pedidos agregadas
router.get('/stats/aggregated', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where: any = {
      userId: req.user!.id
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Agregar dados conforme o período solicitado
    const aggregatedData = pedidos.reduce((acc: any, pedido) => {
      const date = pedido.createdAt.toISOString().split('T')[0];
      let key = date;
      
      if (groupBy === 'month') {
        key = date.substring(0, 7); // YYYY-MM
      } else if (groupBy === 'week') {
        const weekNumber = Math.ceil((pedido.createdAt.getDate() - pedido.createdAt.getDay() + 1) / 7);
        key = `${date.substring(0, 7)}-W${weekNumber}`;
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          count: 0,
          valorTotal: 0,
          valorFrete: 0,
          valorProdutos: 0
        };
      }

      acc[key].count += 1;
      acc[key].valorTotal += pedido.valorTotal;
      acc[key].valorFrete += pedido.valorFrete;
      acc[key].valorProdutos += (pedido.valorTotal - pedido.valorFrete);

      return acc;
    }, {});

    const result = Object.values(aggregatedData).map((item: any) => ({
      ...item,
      ticketMedio: item.count > 0 ? item.valorTotal / item.count : 0,
      fretePercent: item.valorTotal > 0 ? (item.valorFrete / item.valorTotal) * 100 : 0
    }));

    return res.json({
      success: true,
      data: result,
      groupBy
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});

// Deletar pedido (para fins administrativos)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const pedido = await prisma.pedido.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (pedido.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Pedido deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar pedido'
    });
  }
});

export default router;