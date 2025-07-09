import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Buscar usuário e seu token ativo
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        apiTokens: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let token = user.apiTokens[0]?.token;

    // Se não há token ativo, criar um novo
    if (!token) {
      const newToken = await prisma.apiToken.create({
        data: {
          userId: user.id,
          name: 'Dashboard Token',
        },
      });
      token = newToken.token;
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error fetching/creating API token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}