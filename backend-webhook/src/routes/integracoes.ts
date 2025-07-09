import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Listar integrações do usuário
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const integracoes = await prisma.integracao.findMany({
      where: {
        userId: req.user!.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remover dados sensíveis da resposta
    const integracoesSafe = integracoes.map(int => ({
      ...int,
      config: int.tipo === 'magazord' ? {
        user: (int.config as any).user || '',
        hasKey: !!(int.config as any).key
      } : int.config
    }));

    return res.json({
      success: true,
      data: integracoesSafe
    });
  } catch (error) {
    console.error('Erro ao buscar integrações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar integrações'
    });
  }
});

// Salvar/Atualizar integração Magazord
router.post('/magazord', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { user, key } = req.body;

    if (!user || !key) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e chave são obrigatórios'
      });
    }

    const integracao = await prisma.integracao.upsert({
      where: {
        userId_tipo: {
          userId: req.user!.id,
          tipo: 'magazord'
        }
      },
      update: {
        nome: 'Magazord E-commerce',
        config: {
          user,
          key
        },
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId: req.user!.id,
        tipo: 'magazord',
        nome: 'Magazord E-commerce',
        config: {
          user,
          key
        }
      }
    });

    return res.json({
      success: true,
      data: {
        ...integracao,
        config: {
          user,
          hasKey: true
        }
      }
    });
  } catch (error) {
    console.error('Erro ao salvar integração Magazord:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao salvar integração'
    });
  }
});

// Gerar novo token da API
router.post('/generate-token', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome do token é obrigatório'
      });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');

    const apiToken = await prisma.apiToken.create({
      data: {
        userId: req.user!.id,
        name,
        token
      }
    });

    return res.json({
      success: true,
      data: {
        id: apiToken.id,
        name: apiToken.name,
        token: apiToken.token,
        createdAt: apiToken.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar token'
    });
  }
});

// Listar tokens da API
router.get('/tokens', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const tokens = await prisma.apiToken.findMany({
      where: {
        userId: req.user!.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Erro ao buscar tokens:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar tokens'
    });
  }
});

// Desativar token
router.patch('/tokens/:id/deactivate', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;

    const token = await prisma.apiToken.updateMany({
      where: {
        id,
        userId: req.user!.id
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    if (token.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Token não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Token desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao desativar token'
    });
  }
});

// Ativar token
router.patch('/tokens/:id/activate', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;

    const token = await prisma.apiToken.updateMany({
      where: {
        id,
        userId: req.user!.id
      },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    });

    if (token.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Token não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Token ativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao ativar token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao ativar token'
    });
  }
});

export default router;