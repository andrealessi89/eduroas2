"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Receber dados do Facebook Ads via webhook
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.data || !Array.isArray(payload.data)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de dados inválido'
            });
        }
        const recordsToCreate = payload.data.map(record => {
            const requiredFields = [
                'date', 'accountId', 'accountName', 'cost',
                'impressions', 'clicks', 'conversions',
                'averageCpc', 'conversionValue'
            ];
            for (const field of requiredFields) {
                if (record[field] === undefined) {
                    throw new Error(`Campo obrigatório ausente: ${field}`);
                }
            }
            return {
                userId: req.user.id,
                date: record.date,
                accountId: record.accountId,
                accountName: record.accountName,
                cost: parseFloat(record.cost.toString()),
                impressions: parseInt(record.impressions.toString()),
                clicks: parseInt(record.clicks.toString()),
                conversions: parseFloat(record.conversions.toString()),
                averageCpc: parseFloat(record.averageCpc.toString()),
                conversionValue: parseFloat(record.conversionValue.toString())
            };
        });
        await prisma.facebookAdsData.createMany({
            data: recordsToCreate,
            skipDuplicates: true
        });
        const brasiliaTime = (0, moment_timezone_1.default)().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        console.log(`[${brasiliaTime}] Facebook Ads webhook recebido - User: ${req.user.email} - ${recordsToCreate.length} registros`);
        return res.status(200).json({
            success: true,
            message: 'Dados do Facebook Ads recebidos com sucesso',
            recordsReceived: recordsToCreate.length
        });
    }
    catch (error) {
        console.error('Erro ao processar webhook do Facebook Ads:', error);
        return res.status(400).json({
            success: false,
            error: error.message || 'Erro ao processar dados'
        });
    }
});
// Listar dados do Facebook Ads com filtros
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, accountId } = req.query;
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
        const facebookAdsData = await prisma.facebookAdsData.findMany({
            where,
            orderBy: {
                date: 'desc'
            }
        });
        // Calcular totais
        const totals = facebookAdsData.reduce((acc, record) => ({
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
        return res.json({
            success: true,
            data: facebookAdsData,
            totals,
            count: facebookAdsData.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar dados do Facebook Ads:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar dados'
        });
    }
});
// Buscar dados agregados por período
router.get('/aggregated', auth_1.authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
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
        const data = await prisma.facebookAdsData.findMany({
            where,
            orderBy: {
                date: 'asc'
            }
        });
        // Agregar dados conforme o período solicitado
        const aggregatedData = data.reduce((acc, record) => {
            let key = record.date;
            if (groupBy === 'month') {
                key = record.date.substring(0, 7); // YYYY-MM
            }
            else if (groupBy === 'week') {
                const date = new Date(record.date);
                const weekNumber = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
                key = `${record.date.substring(0, 7)}-W${weekNumber}`;
            }
            if (!acc[key]) {
                acc[key] = {
                    period: key,
                    cost: 0,
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    conversionValue: 0,
                    records: 0
                };
            }
            acc[key].cost += record.cost;
            acc[key].impressions += record.impressions;
            acc[key].clicks += record.clicks;
            acc[key].conversions += record.conversions;
            acc[key].conversionValue += record.conversionValue;
            acc[key].records += 1;
            return acc;
        }, {});
        const result = Object.values(aggregatedData).map((item) => ({
            ...item,
            averageCpc: item.clicks > 0 ? item.cost / item.clicks : 0,
            conversionRate: item.clicks > 0 ? (item.conversions / item.clicks) * 100 : 0,
            roas: item.cost > 0 ? item.conversionValue / item.cost : 0
        }));
        return res.json({
            success: true,
            data: result,
            groupBy
        });
    }
    catch (error) {
        console.error('Erro ao buscar dados agregados:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar dados agregados'
        });
    }
});
exports.default = router;
