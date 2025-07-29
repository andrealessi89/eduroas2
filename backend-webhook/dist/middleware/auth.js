"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const server_1 = require("../server");
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    try {
        const apiToken = await server_1.prisma.apiToken.findUnique({
            where: { token },
            include: { user: true }
        });
        if (!apiToken || !apiToken.isActive) {
            return res.status(403).json({ error: 'Token inválido ou inativo' });
        }
        if (!apiToken.user.isActive) {
            return res.status(403).json({ error: 'Usuário inativo' });
        }
        req.user = {
            id: apiToken.user.id,
            email: apiToken.user.email
        };
        next();
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
