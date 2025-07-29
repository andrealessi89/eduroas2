"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Listar dados do Google Ads
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, accountId, limit = 100, offset = 0 } = req.query;
        const where = {
            userId: req.user.id
        };
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = startDate;
            if (endDate)
                where.date.lte = endDate;
        }
        if (accountId) {
            where.accountId = accountId;
        }
        const [googleAdsData, total] = await Promise.all([
            prisma.googleAdsData.findMany({
                where,
                orderBy: {
                    receivedAt: 'desc'
                },
                take: parseInt(limit),
                skip: parseInt(offset)
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
            ctr: totals._sum.impressions ? (totals._sum.clicks / totals._sum.impressions) * 100 : 0,
            conversionRate: totals._sum.clicks ? (totals._sum.conversions / totals._sum.clicks) * 100 : 0,
            roas: totals._sum.cost ? totals._sum.conversionValue / totals._sum.cost : 0,
            cpa: totals._sum.conversions ? totals._sum.cost / totals._sum.conversions : 0
        };
        return res.json({
            success: true,
            data: googleAdsData,
            total,
            metrics
        });
    }
    catch (error) {
        console.error('Erro ao buscar dados do Google Ads:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar dados do Google Ads'
        });
    }
});
// Buscar dados por ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const data = await prisma.googleAdsData.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Erro ao buscar registro:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar registro'
        });
    }
});
// Deletar registro (para fins administrativos)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const deleted = await prisma.googleAdsData.deleteMany({
            where: {
                id: req.params.id,
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Erro ao deletar registro:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao deletar registro'
        });
    }
});
// Buscar contas únicas
router.get('/accounts/list', auth_1.authenticateToken, async (req, res) => {
    try {
        const accounts = await prisma.googleAdsData.findMany({
            where: {
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Erro ao buscar contas:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar contas'
        });
    }
});
exports.default = router;
