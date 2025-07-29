"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🧹 Limpando dados existentes...');
    // Limpar dados existentes
    await prisma.pedidoItem.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.googleAdsData.deleteMany();
    await prisma.facebookAdsData.deleteMany();
    console.log('✅ Dados limpos');
    // Buscar o primeiro usuário
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('❌ Nenhum usuário encontrado');
        return;
    }
    console.log('👤 Usuário encontrado:', user.email);
    // Criar produtos de teste
    console.log('📦 Criando produtos...');
    const produtos = await Promise.all([
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'Notebook Dell XPS 13',
                sku: 'NB-DELL-XPS13',
                custo: 3500
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'iPhone 15 Pro',
                sku: 'IP-15PRO-128',
                custo: 5200
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'Samsung Galaxy S24',
                sku: 'SM-S24-256',
                custo: 4200
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'iPad Air',
                sku: 'IPAD-AIR-64',
                custo: 3800
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'AirPods Pro',
                sku: 'AIRPODS-PRO-2',
                custo: 1500
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'MacBook Air M2',
                sku: 'MB-AIR-M2-256',
                custo: 6500
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'Monitor LG UltraWide',
                sku: 'MON-LG-UW34',
                custo: 2200
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'Teclado Mecânico RGB',
                sku: 'TEC-MEC-RGB',
                custo: 450
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'Mouse Gamer Logitech',
                sku: 'MOUSE-LOG-G502',
                custo: 280
            }
        }),
        prisma.produto.create({
            data: {
                userId: user.id,
                nome: 'Webcam Full HD',
                sku: 'WEB-FHD-1080',
                custo: 320
            }
        })
    ]);
    console.log('✅ Produtos criados:', produtos.length);
    // Criar pedidos para os últimos 30 dias
    console.log('🛒 Criando pedidos...');
    const hoje = new Date();
    const diasAtras = 30;
    let pedidosCriados = 0;
    for (let i = 0; i < diasAtras; i++) {
        const data = (0, date_fns_1.subDays)(hoje, i);
        const pedidosPorDia = Math.floor(Math.random() * 8) + 3; // 3 a 10 pedidos por dia
        for (let j = 0; j < pedidosPorDia; j++) {
            const numItens = Math.floor(Math.random() * 3) + 1; // 1 a 3 itens por pedido
            const itensPedido = [];
            let valorProduto = 0;
            let custoTotal = 0;
            // Selecionar produtos aleatórios
            const produtosSelecionados = [...produtos].sort(() => Math.random() - 0.5).slice(0, numItens);
            for (const produto of produtosSelecionados) {
                const quantidade = Math.floor(Math.random() * 2) + 1; // 1 ou 2 unidades
                const precoVenda = produto.custo * (1.4 + Math.random() * 0.6); // Margem de 40% a 100%
                const desconto = Math.random() > 0.7 ? precoVenda * 0.1 : 0; // 30% de chance de desconto de 10%
                const valorItem = (precoVenda - desconto) * quantidade;
                itensPedido.push({
                    produtoDerivacaoId: Math.floor(Math.random() * 10000) + 1000,
                    produtoDerivacaoCodigo: produto.sku,
                    produtoNome: produto.nome,
                    quantidade,
                    valorUnitario: precoVenda,
                    valorDesconto: desconto * quantidade,
                    valorItem,
                    custoUnitario: produto.custo,
                    lucroItem: valorItem - (produto.custo * quantidade)
                });
                valorProduto += precoVenda * quantidade;
                custoTotal += produto.custo * quantidade;
            }
            const valorDesconto = itensPedido.reduce((acc, item) => acc + item.valorDesconto, 0);
            const valorFrete = valorProduto > 500 ? 0 : Math.floor(Math.random() * 30) + 15; // Frete grátis acima de R$ 500
            const valorTotal = valorProduto - valorDesconto + valorFrete;
            // Formas de pagamento variadas
            const formasPagamento = ['Cartão de Crédito', 'Pix', 'Boleto', 'Cartão de Débito'];
            const formaPagamento = formasPagamento[Math.floor(Math.random() * formasPagamento.length)];
            // Status do pedido (80% aprovados, 20% outros status)
            const situacao = Math.random() > 0.2 ? 4 : Math.floor(Math.random() * 3) + 1;
            const situacoesDescricao = {
                1: 'Aguardando Pagamento',
                2: 'Em Análise',
                3: 'Cancelado',
                4: 'Aprovado'
            };
            await prisma.pedido.create({
                data: {
                    userId: user.id,
                    idPedido: `${Date.now()}-${j}`,
                    codigo: `00${Date.now()}${j}`,
                    dataHora: data,
                    valorProduto,
                    valorFrete,
                    valorDesconto,
                    valorTotal,
                    pessoaNome: `Cliente ${i}-${j}`,
                    pessoaEmail: `cliente${i}${j}@example.com`,
                    formaPagamento,
                    situacao,
                    situacaoDescricao: situacoesDescricao[situacao],
                    cupomCodigo: Math.random() > 0.8 ? 'PROMO10' : null,
                    cupomDesconto: Math.random() > 0.8 ? valorDesconto : 0,
                    itens: {
                        create: itensPedido
                    }
                }
            });
            pedidosCriados++;
        }
    }
    console.log('✅ Pedidos criados:', pedidosCriados);
    // Criar dados do Google Ads
    console.log('📊 Criando dados do Google Ads...');
    for (let i = 0; i < diasAtras; i++) {
        const data = (0, date_fns_1.subDays)(hoje, i);
        const cost = Math.random() * 200 + 100; // R$ 100 a R$ 300 por dia
        const impressions = Math.floor(Math.random() * 5000) + 2000;
        const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.03)); // CTR de 2% a 5%
        const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.04)); // Taxa de conversão de 2% a 6%
        const conversionValue = conversions * (Math.random() * 200 + 150); // Valor médio de R$ 150 a R$ 350
        await prisma.googleAdsData.create({
            data: {
                userId: user.id,
                date: data.toISOString().split('T')[0],
                accountId: 'GOOGLE-123456',
                accountName: 'Conta Principal',
                cost,
                impressions,
                clicks,
                conversions,
                averageCpc: cost / clicks,
                conversionValue
            }
        });
    }
    console.log('✅ Dados do Google Ads criados');
    // Criar dados do Facebook Ads
    console.log('📊 Criando dados do Facebook Ads...');
    for (let i = 0; i < diasAtras; i++) {
        const data = (0, date_fns_1.subDays)(hoje, i);
        const cost = Math.random() * 150 + 80; // R$ 80 a R$ 230 por dia
        const impressions = Math.floor(Math.random() * 8000) + 3000;
        const clicks = Math.floor(impressions * (0.015 + Math.random() * 0.025)); // CTR de 1.5% a 4%
        const conversions = Math.floor(clicks * (0.015 + Math.random() * 0.035)); // Taxa de conversão de 1.5% a 5%
        const conversionValue = conversions * (Math.random() * 180 + 120); // Valor médio de R$ 120 a R$ 300
        await prisma.facebookAdsData.create({
            data: {
                userId: user.id,
                date: data.toISOString().split('T')[0],
                accountId: 'FB-987654',
                accountName: 'Conta Facebook',
                cost,
                impressions,
                clicks,
                conversions,
                averageCpc: cost / clicks,
                conversionValue
            }
        });
    }
    console.log('✅ Dados do Facebook Ads criados');
    // Resumo
    const totalPedidos = await prisma.pedido.count({ where: { userId: user.id } });
    const totalGoogle = await prisma.googleAdsData.count({ where: { userId: user.id } });
    const totalFacebook = await prisma.facebookAdsData.count({ where: { userId: user.id } });
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`- Produtos: ${produtos.length}`);
    console.log(`- Pedidos: ${totalPedidos}`);
    console.log(`- Dados Google Ads: ${totalGoogle} dias`);
    console.log(`- Dados Facebook Ads: ${totalFacebook} dias`);
}
main()
    .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
