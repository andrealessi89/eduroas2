import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// Função para buscar contas de anúncio do Meta
async function fetchMetaAdAccounts(accessToken: string) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/me?fields=adaccounts{business_name,account_status,balance,currency,spend_cap,name}&access_token=${accessToken}`
    );
    
    if (response.data && response.data.adaccounts && response.data.adaccounts.data) {
      return response.data.adaccounts.data.map((account: any) => ({
        id: account.id,
        name: account.name,
        businessName: account.business_name,
        status: account.account_status,
        balance: account.balance,
        currency: account.currency,
        spendCap: account.spend_cap
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar contas de anúncio do Meta:', error);
    throw error;
  }
}

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
    const integracoesSafe = integracoes.map(int => {
      if (int.tipo === 'magazord') {
        return {
          ...int,
          config: {
            user: (int.config as any).user || '',
            hasKey: !!(int.config as any).key
          }
        };
      } else if (int.tipo === 'meta') {
        return {
          ...int,
          config: {
            accessToken: (int.config as any).accessToken ? 
              (int.config as any).accessToken.substring(0, 10) + '...' : '',
            adAccountId: (int.config as any).adAccountId || '',
            hasToken: !!(int.config as any).accessToken
          }
        };
      }
      return int;
    });

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

// Listar integrações Meta Ads
router.get('/meta', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const integracoes = await prisma.integracao.findMany({
      where: {
        userId: req.user!.id,
        tipo: 'meta'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remover dados sensíveis da resposta
    const integracoesSafe = integracoes.map(int => ({
      ...int,
      config: {
        name: (int.config as any).name || int.nome,
        accessToken: (int.config as any).accessToken ? 
          (int.config as any).accessToken.substring(0, 10) + '...' : '',
        hasToken: !!(int.config as any).accessToken,
        adAccounts: (int.config as any).adAccounts || [],
        selectedAccounts: (int.config as any).selectedAccounts || []
      }
    }));

    return res.json({
      success: true,
      data: integracoesSafe
    });
  } catch (error) {
    console.error('Erro ao buscar integrações Meta Ads:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar integrações'
    });
  }
});

// Criar nova integração Meta Ads
router.post('/meta', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { name, accessToken } = req.body;

    if (!name || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Nome e token de acesso são obrigatórios'
      });
    }

    // Buscar contas de anúncio
    let adAccounts = [];
    try {
      adAccounts = await fetchMetaAdAccounts(accessToken);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido ou erro ao buscar contas de anúncio'
      });
    }

    const integracao = await prisma.integracao.create({
      data: {
        userId: req.user!.id,
        tipo: 'meta',
        nome: name,
        config: {
          name,
          accessToken,
          adAccounts, // Salvar as contas de anúncio
          selectedAccounts: [] // Contas selecionadas (inicialmente vazio)
        }
      }
    });

    return res.json({
      success: true,
      data: {
        ...integracao,
        config: {
          name,
          accessToken: accessToken.substring(0, 10) + '...',
          hasToken: true,
          adAccounts
        }
      }
    });
  } catch (error) {
    console.error('Erro ao criar integração Meta Ads:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar integração'
    });
  }
});

// Atualizar integração Meta Ads
router.put('/meta/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, accessToken } = req.body;

    if (!name || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Nome e token de acesso são obrigatórios'
      });
    }

    const integracao = await prisma.integracao.updateMany({
      where: {
        id,
        userId: req.user!.id,
        tipo: 'meta'
      },
      data: {
        nome: name,
        config: {
          name,
          accessToken
        },
        updatedAt: new Date()
      }
    });

    if (integracao.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integração não encontrada'
      });
    }

    // Buscar a integração atualizada
    const integracaoAtualizada = await prisma.integracao.findUnique({
      where: { id }
    });

    return res.json({
      success: true,
      data: {
        ...integracaoAtualizada,
        config: {
          name,
          accessToken: accessToken.substring(0, 10) + '...',
          hasToken: true
        }
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar integração Meta Ads:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar integração'
    });
  }
});

// Atualizar contas selecionadas da integração Meta Ads
router.patch('/meta/:id/accounts', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;
    const { selectedAccounts } = req.body;

    if (!Array.isArray(selectedAccounts)) {
      return res.status(400).json({
        success: false,
        error: 'Contas selecionadas devem ser um array'
      });
    }

    // Buscar a integração atual
    const integracao = await prisma.integracao.findFirst({
      where: {
        id,
        userId: req.user!.id,
        tipo: 'meta'
      }
    });

    if (!integracao) {
      return res.status(404).json({
        success: false,
        error: 'Integração não encontrada'
      });
    }

    const config = integracao.config as any;
    config.selectedAccounts = selectedAccounts;

    // Atualizar a integração
    await prisma.integracao.update({
      where: { id },
      data: {
        config,
        updatedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Contas selecionadas atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar contas selecionadas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar contas selecionadas'
    });
  }
});

// Excluir integração Meta Ads
router.delete('/meta/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { id } = req.params;

    const integracao = await prisma.integracao.deleteMany({
      where: {
        id,
        userId: req.user!.id,
        tipo: 'meta'
      }
    });

    if (integracao.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integração não encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Integração excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir integração Meta Ads:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao excluir integração'
    });
  }
});

export default router;