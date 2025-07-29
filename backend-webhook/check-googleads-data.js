const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGoogleAdsData() {
  try {
    // Buscar os últimos 5 registros
    const data = await prisma.googleAdsData.findMany({
      orderBy: { receivedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        accountId: true,
        date: true,
        receivedAt: true,
        cost: true
      }
    });

    console.log('📊 Últimos 5 registros do Google Ads:');
    console.log('=====================================');
    
    data.forEach(item => {
      console.log(`ID: ${item.id}`);
      console.log(`Account: ${item.accountId}`);
      console.log(`Date: ${item.date}`);
      console.log(`ReceivedAt: ${item.receivedAt}`);
      console.log(`Cost: ${item.cost}`);
      console.log('-------------------------------------');
    });

    // Verificar se há registros duplicados para mesma data
    const userId = 'cmdmg5y9x0000jlfnvw4cnmf4';
    const duplicates = await prisma.googleAdsData.groupBy({
      by: ['accountId', 'date'],
      where: { userId },
      _count: { id: true },
      having: {
        id: { _count: { gt: 1 } }
      }
    });

    if (duplicates.length > 0) {
      console.log('\n⚠️  Registros duplicados encontrados:');
      console.log(duplicates);
    } else {
      console.log('\n✅ Nenhum registro duplicado encontrado');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGoogleAdsData();