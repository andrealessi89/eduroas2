"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const magazordApi_1 = require("../services/magazordApi");
const dateUtils_1 = require("../utils/dateUtils");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Listar pedidos do usuário com filtros
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, limit = 100, offset = 0, status } = req.query;
        const where = {
            userId: req.user.id
        };
        const dateRange = (0, dateUtils_1.createDateRange)(startDate, endDate);
        if (dateRange) {
            where.dataHora = dateRange;
        }
        const [pedidos, total] = await Promise.all([
            prisma.pedido.findMany({
                where,
                orderBy: {
                    dataHora: 'desc'
                },
                take: parseInt(limit),
                skip: parseInt(offset),
                include: {
                    itens: true
                }
            }),
            prisma.pedido.count({ where })
        ]);
        // Adicionar informações de status de processamento
        const pedidosComStatus = pedidos.map(pedido => {
            const itensSemCusto = pedido.itens.filter(item => item.custoUnitario === 0);
            const custoTotal = pedido.itens.reduce((acc, item) => acc + (item.custoUnitario * item.quantidade), 0);
            const lucroTotal = pedido.valorTotal - custoTotal - pedido.valorFrete;
            return {
                ...pedido,
                statusProcessamento: {
                    processado: true,
                    temErros: itensSemCusto.length > 0,
                    produtosSemCusto: itensSemCusto.map(item => ({
                        codigo: item.produtoDerivacaoCodigo,
                        nome: item.produtoNome,
                        quantidade: item.quantidade
                    })),
                    custoTotal,
                    lucroTotal,
                    margemLucro: pedido.valorTotal > 0 ? (lucroTotal / pedido.valorTotal) * 100 : 0
                }
            };
        });
        // Filtrar por status se solicitado
        let pedidosFiltrados = pedidosComStatus;
        if (status === 'com-erro') {
            pedidosFiltrados = pedidosComStatus.filter(p => p.statusProcessamento.temErros);
        }
        else if (status === 'sem-erro') {
            pedidosFiltrados = pedidosComStatus.filter(p => !p.statusProcessamento.temErros);
        }
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
            data: pedidosFiltrados,
            total,
            totals: {
                count: totals._count.id,
                valorTotal: totals._sum.valorTotal || 0,
                valorFrete: totals._sum.valorFrete || 0,
                valorProdutos: (totals._sum.valorTotal || 0) - (totals._sum.valorFrete || 0),
                pedidosComErro: pedidosComStatus.filter(p => p.statusProcessamento.temErros).length
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar pedidos'
        });
    }
});
// Buscar pedido por ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const pedido = await prisma.pedido.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                itens: true
            }
        });
        if (!pedido) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado'
            });
        }
        // Adicionar informações detalhadas de processamento
        const itensSemCusto = pedido.itens.filter(item => item.custoUnitario === 0);
        const custoTotal = pedido.itens.reduce((acc, item) => acc + (item.custoUnitario * item.quantidade), 0);
        const lucroTotal = pedido.valorTotal - custoTotal - pedido.valorFrete;
        const pedidoDetalhado = {
            ...pedido,
            statusProcessamento: {
                processado: true,
                temErros: itensSemCusto.length > 0,
                produtosSemCusto: itensSemCusto.map(item => ({
                    codigo: item.produtoDerivacaoCodigo,
                    nome: item.produtoNome,
                    quantidade: item.quantidade,
                    valorItem: item.valorItem
                })),
                custoTotal,
                lucroTotal,
                margemLucro: pedido.valorTotal > 0 ? (lucroTotal / pedido.valorTotal) * 100 : 0,
                fretePercentual: pedido.valorTotal > 0 ? (pedido.valorFrete / pedido.valorTotal) * 100 : 0
            }
        };
        return res.json({
            success: true,
            data: pedidoDetalhado
        });
    }
    catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar pedido'
        });
    }
});
// Webhook para receber pedidos do e-commerce
router.post('/webhook/:userId/ecommerce', async (req, res) => {
    try {
        const { userId } = req.params;
        const pedidoData = req.body;
        // Buscar o usuário pelo ID
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }
        // Adicionar usuário ao request para manter compatibilidade
        req.user = user;
        // Validar se é um pedido com situação 4 (aprovado)
        if (pedidoData.pedidoSituacao !== 4) {
            return res.status(200).json({
                success: true,
                message: 'Pedido ignorado - situação diferente de 4',
                situacao: pedidoData.pedidoSituacao
            });
        }
        // Verificar se o pedido já existe para este usuário
        if (pedidoData.codigo) {
            const pedidoExistente = await prisma.pedido.findFirst({
                where: {
                    codigo: pedidoData.codigo,
                    userId: userId
                }
            });
            if (pedidoExistente) {
                return res.status(200).json({
                    success: true,
                    message: 'Pedido já processado anteriormente para este usuário',
                    codigo: pedidoData.codigo
                });
            }
        }
        // Buscar serviço da API Magazord
        const magazordApi = await magazordApi_1.MagazordApiService.createFromUserId(req.user.id);
        if (!magazordApi) {
            return res.status(400).json({
                success: false,
                error: 'Integração com Magazord não configurada ou inativa'
            });
        }
        // Coletar todos os códigos de produtos únicos
        const produtosSku = new Set();
        for (const rastreio of pedidoData.arrayPedidoRastreio || []) {
            for (const item of rastreio.pedidoItem || []) {
                produtosSku.add(item.produtoDerivacaoCodigo);
            }
        }
        // Buscar custos via API da Magazord
        const custosProdutos = await magazordApi.buscarCustosProdutos(Array.from(produtosSku));
        // Calcular valores totais
        let custoTotal = 0;
        const itensToCreate = [];
        const produtosSemCusto = [];
        for (const rastreio of pedidoData.arrayPedidoRastreio || []) {
            for (const item of rastreio.pedidoItem || []) {
                const custoProduto = custosProdutos.get(item.produtoDerivacaoCodigo);
                const custoUnitario = custoProduto?.custo || 0;
                const lucroItem = item.valorItem - (custoUnitario * item.quantidade);
                custoTotal += custoUnitario * item.quantidade;
                // Registrar produtos sem custo para posterior notificação
                if (!custoProduto || custoProduto.custo === 0) {
                    produtosSemCusto.push(item.produtoDerivacaoCodigo);
                }
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
                    connect: { id: req.user.id }
                },
                idPedido: pedidoData.id.toString(),
                codigo: pedidoData.codigo || '',
                dataHora: (0, dateUtils_1.parseBrazilDate)(pedidoData.dataHora),
                valorProduto: parseFloat(pedidoData.valorProduto || '0'),
                valorFrete: parseFloat(pedidoData.valorFrete || '0'),
                valorDesconto: parseFloat(pedidoData.valorDesconto || '0'),
                valorTotal: parseFloat(pedidoData.valorTotal || '0'),
                pessoaNome: pedidoData.pessoaNome || 'Cliente não informado',
                pessoaEmail: pedidoData.pessoaEmail || '',
                formaPagamento: pedidoData.formaPagamentoNome || 'Não informado',
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
        const brasiliaTime = (0, moment_timezone_1.default)().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        console.log(`[${brasiliaTime}] Pedido aprovado recebido - User: ${req.user.email} - Código: ${pedido.codigo} - Lucro: R$ ${lucroTotal.toFixed(2)}`);
        if (produtosSemCusto.length > 0) {
            console.warn(`[${brasiliaTime}] Produtos sem custo no pedido ${pedido.codigo}: ${produtosSemCusto.join(', ')}`);
        }
        return res.status(200).json({
            success: true,
            message: 'Pedido processado com sucesso',
            data: {
                codigo: pedido.codigo,
                valorTotal: pedido.valorTotal,
                custoTotal,
                lucroTotal,
                itens: pedido.itens.length,
                produtosSemCusto: produtosSemCusto.length > 0 ? produtosSemCusto : undefined
            }
        });
    }
    catch (error) {
        console.error('Erro ao processar webhook de pedido:', error);
        return res.status(400).json({
            success: false,
            error: error.message || 'Erro ao processar pedido'
        });
    }
});
// Buscar estatísticas de pedidos agregadas
router.get('/stats/aggregated', auth_1.authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        const where = {
            userId: req.user.id
        };
        const dateRange = (0, dateUtils_1.createDateRange)(startDate, endDate);
        if (dateRange) {
            where.dataHora = dateRange;
        }
        const pedidos = await prisma.pedido.findMany({
            where,
            orderBy: {
                dataHora: 'asc'
            }
        });
        // Agregar dados conforme o período solicitado
        const aggregatedData = pedidos.reduce((acc, pedido) => {
            const date = pedido.dataHora.toISOString().split('T')[0];
            let key = date;
            if (groupBy === 'month') {
                key = date.substring(0, 7); // YYYY-MM
            }
            else if (groupBy === 'week') {
                const weekNumber = Math.ceil((pedido.dataHora.getDate() - pedido.dataHora.getDay() + 1) / 7);
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
        const result = Object.values(aggregatedData).map((item) => ({
            ...item,
            ticketMedio: item.count > 0 ? item.valorTotal / item.count : 0,
            fretePercent: item.valorTotal > 0 ? (item.valorFrete / item.valorTotal) * 100 : 0
        }));
        return res.json({
            success: true,
            data: result,
            groupBy
        });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar estatísticas'
        });
    }
});
// Reprocessar custos de um pedido
router.post('/:id/reprocessar-custos', auth_1.authenticateToken, async (req, res) => {
    try {
        // Buscar o pedido com seus itens
        const pedido = await prisma.pedido.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                itens: true
            }
        });
        if (!pedido) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado'
            });
        }
        // Buscar serviço da API Magazord
        const magazordApi = await magazordApi_1.MagazordApiService.createFromUserId(req.user.id);
        if (!magazordApi) {
            return res.status(400).json({
                success: false,
                error: 'Integração com Magazord não configurada ou inativa'
            });
        }
        // Coletar códigos de produtos
        const produtosSku = pedido.itens.map(item => item.produtoDerivacaoCodigo);
        // Buscar custos atualizados via API da Magazord
        const custosProdutos = await magazordApi.buscarCustosProdutos(produtosSku);
        // Atualizar custos dos itens
        let custoTotal = 0;
        const itensAtualizados = [];
        const produtosSemCusto = [];
        for (const item of pedido.itens) {
            const custoProduto = custosProdutos.get(item.produtoDerivacaoCodigo);
            const custoUnitario = custoProduto?.custo || 0;
            const lucroItem = item.valorItem - (custoUnitario * item.quantidade);
            custoTotal += custoUnitario * item.quantidade;
            // Registrar produtos sem custo
            if (!custoProduto || custoProduto.custo === 0) {
                produtosSemCusto.push(item.produtoDerivacaoCodigo);
            }
            // Atualizar o item se o custo mudou
            if (item.custoUnitario !== custoUnitario) {
                await prisma.pedidoItem.update({
                    where: { id: item.id },
                    data: {
                        custoUnitario,
                        lucroItem
                    }
                });
                itensAtualizados.push({
                    produtoDerivacaoCodigo: item.produtoDerivacaoCodigo,
                    custoAnterior: item.custoUnitario,
                    custoNovo: custoUnitario
                });
            }
        }
        const lucroTotal = pedido.valorTotal - custoTotal - pedido.valorFrete;
        const brasiliaTime = (0, moment_timezone_1.default)().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        console.log(`[${brasiliaTime}] Custos reprocessados para pedido ${pedido.codigo} - User: ${req.user.email} - Novos custos: ${itensAtualizados.length} itens`);
        return res.json({
            success: true,
            message: 'Custos reprocessados com sucesso',
            data: {
                codigo: pedido.codigo,
                valorTotal: pedido.valorTotal,
                custoTotal,
                lucroTotal,
                itensAtualizados: itensAtualizados.length,
                detalhesAtualizacao: itensAtualizados,
                produtosSemCusto: produtosSemCusto.length > 0 ? produtosSemCusto : undefined
            }
        });
    }
    catch (error) {
        console.error('Erro ao reprocessar custos:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao reprocessar custos'
        });
    }
});
// Buscar pedidos com produtos sem custo
router.get('/sem-custo', auth_1.authenticateToken, async (req, res) => {
    try {
        // Buscar todos os itens de pedido com custo zero
        const itensSemCusto = await prisma.pedidoItem.findMany({
            where: {
                custoUnitario: 0,
                pedido: {
                    userId: req.user.id
                }
            },
            include: {
                pedido: {
                    select: {
                        id: true,
                        codigo: true,
                        dataHora: true,
                        valorTotal: true
                    }
                }
            }
        });
        // Agrupar por pedido
        const pedidosMap = new Map();
        for (const item of itensSemCusto) {
            if (!pedidosMap.has(item.pedido.id)) {
                pedidosMap.set(item.pedido.id, {
                    ...item.pedido,
                    produtosSemCusto: []
                });
            }
            pedidosMap.get(item.pedido.id).produtosSemCusto.push({
                produtoDerivacaoCodigo: item.produtoDerivacaoCodigo,
                produtoNome: item.produtoNome,
                quantidade: item.quantidade,
                valorItem: item.valorItem
            });
        }
        const pedidosComProdutosSemCusto = Array.from(pedidosMap.values());
        return res.json({
            success: true,
            data: pedidosComProdutosSemCusto,
            total: pedidosComProdutosSemCusto.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar pedidos sem custo:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar pedidos sem custo'
        });
    }
});
// Deletar pedido (para fins administrativos)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const pedido = await prisma.pedido.deleteMany({
            where: {
                id: req.params.id,
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Erro ao deletar pedido:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao deletar pedido'
        });
    }
});
// Endpoint para obter URL do webhook
router.get('/webhook/url', auth_1.authenticateToken, async (req, res) => {
    try {
        const baseUrl = process.env.BACKEND_URL || 'https://api.dashproapp.com.br';
        const webhookUrl = `${baseUrl}/pedidos/webhook/${req.user.id}/ecommerce`;
        return res.json({
            success: true,
            data: {
                url: webhookUrl,
                method: 'POST',
                contentType: 'application/json',
                description: 'Use esta URL no webhook da Magazord para receber pedidos aprovados (situação 4)'
            }
        });
    }
    catch (error) {
        console.error('Erro ao gerar URL do webhook:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao gerar URL do webhook'
        });
    }
});
exports.default = router;
