const { PrismaClient } = require('./frontend/src/generated/prisma');

const prisma = new PrismaClient();

async function addUser(email, name) {
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { isActive: true },
      create: {
        email,
        name: name || email.split('@')[0],
        isActive: true
      }
    });
    
    console.log(`✅ Usuário ${email} adicionado com sucesso!`);
    console.log(user);
  } catch (error) {
    console.error('❌ Erro ao adicionar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Adicionar o usuário
addUser('educnreis33@gmail.com', 'Eduardo Reis');