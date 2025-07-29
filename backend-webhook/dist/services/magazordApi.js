"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagazordApiService = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MagazordApiService {
    constructor(baseUrl, user, key) {
        this.baseUrl = baseUrl;
        this.user = user;
        this.key = key;
    }
    static async createFromUserId(userId) {
        const integracao = await prisma.integracao.findUnique({
            where: {
                userId_tipo: {
                    userId,
                    tipo: 'magazord'
                }
            }
        });
        if (!integracao || !integracao.isActive) {
            return null;
        }
        const config = integracao.config;
        if (!config.user || !config.key) {
            return null;
        }
        // Assumindo que o baseUrl é fixo para a loja
        const baseUrl = 'https://colecionadordesonhos.painel.magazord.com.br/api/v1';
        return new MagazordApiService(baseUrl, config.user, config.key);
    }
    async buscarCustoProduto(produtoDerivacaoCodigo) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/listEstoque`, {
                params: {
                    produto: produtoDerivacaoCodigo
                },
                auth: {
                    username: this.user,
                    password: this.key
                },
                timeout: 10000 // 10 segundos de timeout
            });
            if (response.data.data && response.data.data.length > 0) {
                const produto = response.data.data[0];
                return {
                    custo: produto.custoMedio || 0,
                    descricao: produto.descricaoProduto
                };
            }
            return null;
        }
        catch (error) {
            console.error(`Erro ao buscar custo do produto ${produtoDerivacaoCodigo}:`, error);
            throw error;
        }
    }
    async buscarCustosProdutos(codigosProdutos) {
        const resultados = new Map();
        // Processar em lotes para evitar muitas requisições simultâneas
        const batchSize = 5;
        for (let i = 0; i < codigosProdutos.length; i += batchSize) {
            const batch = codigosProdutos.slice(i, i + batchSize);
            const promises = batch.map(codigo => this.buscarCustoProduto(codigo)
                .then(result => ({ codigo, result, error: null }))
                .catch(error => ({ codigo, result: null, error })));
            const batchResults = await Promise.all(promises);
            for (const { codigo, result, error } of batchResults) {
                if (result) {
                    resultados.set(codigo, result);
                }
                else if (error) {
                    console.error(`Falha ao buscar custo do produto ${codigo}:`, error);
                }
            }
        }
        return resultados;
    }
}
exports.MagazordApiService = MagazordApiService;
