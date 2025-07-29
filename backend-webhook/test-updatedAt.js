const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUpdatedAt() {
  try {
    // Buscar o registro mais recente
    const data = await prisma.googleAdsData.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (data) {
      console.log('📊 Registro do Google Ads:');
      console.log('ID:', data.id);
      console.log('Account:', data.accountId);
      console.log('Date:', data.date);
      console.log('ReceivedAt:', data.receivedAt);
      console.log('UpdatedAt:', data.updatedAt);
      console.log('\n📅 Diferença entre updatedAt e receivedAt:');
      const diff = new Date(data.updatedAt).getTime() - new Date(data.receivedAt).getTime();
      console.log(`${diff / 1000} segundos`);
    } else {
      console.log('Nenhum registro encontrado');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUpdatedAt();