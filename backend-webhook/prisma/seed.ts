import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Buscar o primeiro usuário existente ou criar um
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('Nenhum usuário encontrado. Criando usuário de teste...');
    user = await prisma.user.create({
      data: {
        email: 'andrealessi89@gmail.com',
        name: 'Andre Alessi',
        isActive: true
      }
    });
  }

  console.log(`Populando dados para o usuário: ${user.email}`);

  // Popular produtos com SKUs reais do e-commerce
  const produtos = await prisma.produto.createMany({
    data: [
      // Pijamas
      {
        userId: user.id,
        nome: 'Pijama Americano Curto Rosa Xadrez - P',
        sku: 'PSAPLWFP',
        custo: 28.50
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Curto Rosa Xadrez - M',
        sku: 'PSAPLWFM',
        custo: 28.50
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Curto Rosa Xadrez - G',
        sku: 'PSAPLWFG',
        custo: 28.50
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Curto Rosa Xadrez - GG',
        sku: 'PSAPLWFGG',
        custo: 28.50
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Star Marinho Longo - P',
        sku: 'PLALRP',
        custo: 35.00
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Star Marinho Longo - M',
        sku: 'PLALRM',
        custo: 35.00
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Star Marinho Longo - G',
        sku: 'PLALRG',
        custo: 35.00
      },
      {
        userId: user.id,
        nome: 'Pijama Americano Star Marinho Longo - GG',
        sku: 'PLALRGG',
        custo: 35.00
      },
      // Outros produtos
      {
        userId: user.id,
        nome: 'Camisola Floral - P',
        sku: 'CAMFLOP',
        custo: 22.00
      },
      {
        userId: user.id,
        nome: 'Camisola Floral - M',
        sku: 'CAMFLOM',
        custo: 22.00
      },
      {
        userId: user.id,
        nome: 'Camisola Floral - G',
        sku: 'CAMFLOG',
        custo: 22.00
      },
      {
        userId: user.id,
        nome: 'Pijama Infantil Unicórnio - 4',
        sku: 'PIJUNI4',
        custo: 18.50
      },
      {
        userId: user.id,
        nome: 'Pijama Infantil Unicórnio - 6',
        sku: 'PIJUNI6',
        custo: 18.50
      },
      {
        userId: user.id,
        nome: 'Pijama Infantil Unicórnio - 8',
        sku: 'PIJUNI8',
        custo: 18.50
      },
      {
        userId: user.id,
        nome: 'Robe de Cetim - P',
        sku: 'ROBECETP',
        custo: 45.00
      },
      {
        userId: user.id,
        nome: 'Robe de Cetim - M',
        sku: 'ROBECETM',
        custo: 45.00
      },
      {
        userId: user.id,
        nome: 'Robe de Cetim - G',
        sku: 'ROBECETG',
        custo: 45.00
      }
    ],
    skipDuplicates: true
  });

  console.log(`${produtos.count} produtos criados`);

  // Popular Facebook Ads Data
  const today = new Date();
  const facebookAdsData = [];
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    facebookAdsData.push({
      userId: user.id,
      date: date.toISOString().split('T')[0],
      accountId: 'FB-123456789',
      accountName: 'Conta Principal Facebook',
      cost: 250 + Math.random() * 200,
      impressions: Math.floor(10000 + Math.random() * 5000),
      clicks: Math.floor(300 + Math.random() * 200),
      conversions: 15 + Math.random() * 10,
      averageCpc: 0.8 + Math.random() * 0.4,
      conversionValue: 1500 + Math.random() * 1000
    });
  }

  const fbAds = await prisma.facebookAdsData.createMany({
    data: facebookAdsData,
    skipDuplicates: true
  });

  console.log(`${fbAds.count} registros de Facebook Ads criados`);

  // Não vamos popular pedidos aqui, eles virão via webhook
  console.log('Pedidos serão recebidos via webhook');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });