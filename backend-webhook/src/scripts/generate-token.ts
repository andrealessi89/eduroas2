import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function generateApiToken(email: string, tokenName: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      return;
    }

    if (!user.isActive) {
      console.error(`❌ Usuário ${email} está inativo`);
      return;
    }

    const apiToken = await prisma.apiToken.create({
      data: {
        userId: user.id,
        name: tokenName
      }
    });

    console.log('✅ Token API gerado com sucesso!');
    console.log('='.repeat(50));
    console.log(`Usuário: ${user.email}`);
    console.log(`Nome do token: ${apiToken.name}`);
    console.log(`Token: ${apiToken.token}`);
    console.log('='.repeat(50));
    console.log('\nUse este token no script do Google Ads:');
    console.log(`const BACKEND_TOKEN = '${apiToken.token}';`);
    console.log('\nE no header Authorization:');
    console.log(`Authorization: Bearer ${apiToken.token}`);
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
const tokenName = process.argv[3] || 'Google Ads API Token';

if (!email) {
  console.log('Uso: npm run generate-token <email> [nome-do-token]');
  console.log('Exemplo: npm run generate-token usuario@example.com "Meu Token Google Ads"');
  process.exit(1);
}

generateApiToken(email, tokenName);