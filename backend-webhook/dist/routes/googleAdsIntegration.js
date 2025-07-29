"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
const facebookAdsService_1 = require("../services/facebookAdsService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Listar tokens do Google Ads
router.get('/tokens', auth_1.authenticateToken, async (req, res) => {
    try {
        const integracoes = await prisma.integracao.findMany({
            where: {
                userId: req.user.id,
                tipo: 'google'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Formatar como tokens para o frontend
        const tokens = integracoes.map(int => {
            const config = int.config;
            return {
                id: int.id,
                name: int.nome,
                token: config.token || '',
                isActive: int.isActive,
                createdAt: int.createdAt,
                updatedAt: int.updatedAt
            };
        });
        return res.json({
            success: true,
            data: tokens
        });
    }
    catch (error) {
        console.error('Erro ao buscar tokens Google Ads:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar tokens'
        });
    }
});
// Gerar novo token do Google Ads
router.post('/generate-token', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Nome do token é obrigatório'
            });
        }
        // Gerar token único
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const integracao = await prisma.integracao.create({
            data: {
                userId: req.user.id,
                tipo: 'google',
                nome: name,
                config: {
                    token
                }
            }
        });
        return res.json({
            success: true,
            data: {
                id: integracao.id,
                name: integracao.nome,
                token,
                isActive: integracao.isActive,
                createdAt: integracao.createdAt,
                updatedAt: integracao.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Erro ao gerar token Google Ads:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao gerar token'
        });
    }
});
// Desativar token
router.patch('/tokens/:id/deactivate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const integracao = await prisma.integracao.updateMany({
            where: {
                id,
                userId: req.user.id,
                tipo: 'google'
            },
            data: {
                isActive: false,
                updatedAt: new Date()
            }
        });
        if (integracao.count === 0) {
            return res.status(404).json({
                success: false,
                error: 'Token não encontrado'
            });
        }
        return res.json({
            success: true,
            message: 'Token desativado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao desativar token:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao desativar token'
        });
    }
});
// Ativar token
router.patch('/tokens/:id/activate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const integracao = await prisma.integracao.updateMany({
            where: {
                id,
                userId: req.user.id,
                tipo: 'google'
            },
            data: {
                isActive: true,
                updatedAt: new Date()
            }
        });
        if (integracao.count === 0) {
            return res.status(404).json({
                success: false,
                error: 'Token não encontrado'
            });
        }
        return res.json({
            success: true,
            message: 'Token ativado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao ativar token:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao ativar token'
        });
    }
});
// Webhook para receber dados do Google Ads
router.post('/webhook', async (req, res) => {
    try {
        // Extrair token do header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token não fornecido'
            });
        }
        const token = authHeader.substring(7);
        // Buscar integração pelo token
        const integracao = await prisma.integracao.findFirst({
            where: {
                tipo: 'google',
                isActive: true,
                config: {
                    path: ['token'],
                    equals: token
                }
            }
        });
        if (!integracao) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou inativo'
            });
        }
        // Validar dados do webhook
        const data = req.body;
        if (!data.date || !data.accountId || !data.accountName) {
            return res.status(400).json({
                success: false,
                error: 'Dados incompletos'
            });
        }
        // Verificar se já existe registro para esta data e conta
        const existingData = await prisma.googleAdsData.findFirst({
            where: {
                userId: integracao.userId,
                accountId: data.accountId,
                date: data.date
            }
        });
        const dataToSave = {
            userId: integracao.userId,
            date: data.date,
            accountId: data.accountId,
            accountName: data.accountName,
            cost: data.cost || 0,
            impressions: data.impressions || 0,
            clicks: data.clicks || 0,
            conversions: data.conversions || 0,
            averageCpc: data.averageCpc || 0,
            conversionValue: data.conversionValue || 0
        };
        if (existingData) {
            await prisma.googleAdsData.update({
                where: { id: existingData.id },
                data: dataToSave
            });
        }
        else {
            await prisma.googleAdsData.create({
                data: dataToSave
            });
        }
        console.log(`Dados do Google Ads salvos para conta ${data.accountId} - ${data.date}`);
        // Atualizar também os dados do Facebook Ads para o mesmo usuário e data
        try {
            console.log(`Iniciando atualização do Facebook Ads para usuário ${integracao.userId} - ${data.date}`);
            await facebookAdsService_1.FacebookAdsService.fetchAndSaveInsights(integracao.userId, data.date);
            console.log(`Dados do Facebook Ads atualizados com sucesso`);
        }
        catch (fbError) {
            console.error('Erro ao atualizar dados do Facebook Ads:', fbError);
            // Não retornamos erro pois o Google Ads foi salvo com sucesso
        }
        return res.json({
            success: true,
            message: 'Dados recebidos com sucesso',
            facebookAdsUpdated: true
        });
    }
    catch (error) {
        console.error('Erro no webhook do Google Ads:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao processar webhook'
        });
    }
});
// Endpoint de teste para verificar se o webhook está funcionando
router.get('/webhook/test', async (req, res) => {
    return res.json({
        success: true,
        message: 'Webhook do Google Ads está funcionando',
        expectedHeaders: {
            Authorization: 'Bearer <seu-token-aqui>'
        },
        expectedBody: {
            date: 'YYYY-MM-DD',
            accountId: 'string',
            accountName: 'string',
            cost: 'number',
            impressions: 'number',
            clicks: 'number',
            conversions: 'number',
            averageCpc: 'number',
            conversionValue: 'number (opcional)'
        }
    });
});
exports.default = router;
