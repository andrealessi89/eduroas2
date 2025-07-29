"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const server_1 = require("../server");
// import { getBrazilTime } from '../utils/timezone'; // Não mais necessário
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const payload = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const requiredFields = [
            'date', 'accountId', 'accountName', 'cost',
            'impressions', 'clicks', 'conversions',
            'averageCpc', 'conversionValue'
        ];
        for (const field of requiredFields) {
            if (payload[field] === undefined) {
                return res.status(400).json({
                    error: `Campo obrigatório ausente: ${field}`
                });
            }
        }
        // Verificar se já existe um registro para esta data e conta
        console.log(`🔍 Buscando registro existente para userId: ${req.user.id}, accountId: ${payload.accountId}, date: ${payload.date}`);
        const existingData = await server_1.prisma.googleAdsData.findFirst({
            where: {
                userId: req.user.id,
                accountId: payload.accountId,
                date: payload.date
            }
        });
        console.log(`🔍 Registro existente encontrado:`, existingData ? `ID: ${existingData.id}, receivedAt: ${existingData.receivedAt}` : 'Nenhum');
        let googleAdsData;
        if (existingData) {
            // Atualizar registro existente
            console.log(`📅 Atualizando dados para registro ID: ${existingData.id}`);
            console.log(`📅 UpdatedAt anterior: ${existingData.updatedAt}`);
            // Atualizar dados - o Prisma automaticamente atualizará o updatedAt
            googleAdsData = await server_1.prisma.googleAdsData.update({
                where: { id: existingData.id },
                data: {
                    accountName: payload.accountName,
                    cost: payload.cost,
                    impressions: payload.impressions,
                    clicks: payload.clicks,
                    conversions: payload.conversions,
                    averageCpc: payload.averageCpc,
                    conversionValue: payload.conversionValue
                    // updatedAt será atualizado automaticamente pelo Prisma
                }
            });
            console.log(`✅ Dados atualizados do Google Ads para usuário ${req.user.email}`);
            console.log(`📅 UpdatedAt novo: ${googleAdsData.updatedAt}`);
        }
        else {
            // Criar novo registro
            googleAdsData = await server_1.prisma.googleAdsData.create({
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
                    receivedAt: new Date()
                    // updatedAt será atualizado automaticamente pelo Prisma
                }
            });
            console.log(`✅ Novos dados salvos do Google Ads para usuário ${req.user.email}`);
        }
        if (googleAdsData) {
            console.log(`✅ Dados recebidos do Google Ads para usuário ${req.user.email}:`, {
                accountId: payload.accountId,
                date: payload.date,
                receivedAt: googleAdsData.receivedAt,
                receivedAtISO: googleAdsData.receivedAt.toISOString(),
                isUpdate: !!existingData
            });
            res.status(201).json({
                success: true,
                message: 'Dados recebidos com sucesso',
                id: googleAdsData.id,
                receivedAt: googleAdsData.receivedAt
            });
        }
        else {
            throw new Error('Falha ao processar dados do Google Ads');
        }
    }
    catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        res.status(500).json({
            error: 'Erro ao processar dados',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
router.get('/test', auth_1.authenticateToken, async (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint funcionando',
        user: req.user,
        timestamp: new Date()
    });
});
exports.default = router;
