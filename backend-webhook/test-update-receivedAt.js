const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
  try {
    const userId = 'cmdmg5y9x0000jlfnvw4cnmf4';
    const accountId = '402-354-2791';
    const date = '2025-07-28';

    console.log('🔍 Buscando registro existente...');
    const existingData = await prisma.googleAdsData.findFirst({
      where: { userId, accountId, date }
    });

    if (existingData) {
      console.log(`✅ Registro encontrado:`, {
        id: existingData.id,
        receivedAt: existingData.receivedAt
      });

      console.log('\n🔄 Atualizando receivedAt...');
      const newReceivedAt = new Date();
      
      const updated = await prisma.googleAdsData.update({
        where: { id: existingData.id },
        data: { receivedAt: newReceivedAt }
      });

      console.log(`✅ Registro atualizado:`, {
        id: updated.id,
        receivedAt: updated.receivedAt,
        receivedAtISO: updated.receivedAt.toISOString()
      });

      // Verificar se realmente foi atualizado
      const checkUpdate = await prisma.googleAdsData.findUnique({
        where: { id: existingData.id }
      });

      console.log(`\n🔍 Verificação após update:`, {
        id: checkUpdate.id,
        receivedAt: checkUpdate.receivedAt,
        receivedAtISO: checkUpdate.receivedAt.toISOString()
      });

    } else {
      console.log('❌ Nenhum registro encontrado para atualizar');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();