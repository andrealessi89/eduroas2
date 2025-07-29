import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');
  
  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
    },
  });
  
  // Adicionar Andre Alessi
  const andre = await prisma.user.upsert({
    where: { email: 'andrealessi89@gmail.com' },
    update: { isActive: true },
    create: {
      email: 'andrealessi89@gmail.com',
      name: 'Andre Alessi',
      isActive: true,
      role: 'ADMIN'
    },
  });
  
  console.log('Usuário criado:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });