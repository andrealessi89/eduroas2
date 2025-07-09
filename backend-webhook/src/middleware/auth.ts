import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const apiToken = await prisma.apiToken.findUnique({
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
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}