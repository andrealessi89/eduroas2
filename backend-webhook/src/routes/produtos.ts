import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar produtos do usuário
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        userId: req.user!.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos'
    });
  }
});

// Buscar produto por ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const produto = await prisma.produto.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    return res.json({
      success: true,
      data: produto
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar produto'
    });
  }
});

// Criar novo produto
router.post('/', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { nome, sku, custo } = req.body;

    if (!nome || !sku || custo === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome, sku, custo'
      });
    }

    const produto = await prisma.produto.create({
      data: {
        userId: req.user!.id,
        nome,
        sku,
        custo: parseFloat(custo)
      }
    });

    return res.status(201).json({
      success: true,
      data: produto
    });
  } catch (error: any) {
    console.error('Erro ao criar produto:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'SKU já cadastrado para este usuário'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao criar produto'
    });
  }
});

// Atualizar produto
router.put('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { nome, sku, custo } = req.body;

    const produto = await prisma.produto.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        ...(nome && { nome }),
        ...(sku && { sku }),
        ...(custo !== undefined && { custo: parseFloat(custo) })
      }
    });

    if (produto.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const produtoAtualizado = await prisma.produto.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    return res.json({
      success: true,
      data: produtoAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'SKU já cadastrado para este usuário'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar produto'
    });
  }
});

// Deletar produto
router.delete('/:id', authenticateToken, async (req: AuthRequest, res): Promise<any> => {
  try {
    const produto = await prisma.produto.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (produto.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar produto'
    });
  }
});

export default router;