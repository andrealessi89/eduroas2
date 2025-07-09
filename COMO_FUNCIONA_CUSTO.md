# 💰 Como o Sistema Calcula o Custo dos Produtos

Este documento explica de forma simples como o sistema calcula o custo e lucro dos produtos vendidos.

## 📦 1. Primeiro, você cadastra os produtos

Imagine que você vende pijamas. Para cada modelo e tamanho, você cadastra:

```
Nome: Pijama Rosa - Tamanho GG
SKU: PSAPLWFGG (código único do produto)
Custo: R$ 28,50 (quanto você paga por ele)
```

**Importante**: O SKU precisa ser EXATAMENTE igual ao que seu e-commerce usa!

## 🛒 2. Quando alguém compra no seu site

Seu e-commerce envia os dados da venda para o sistema:

```
Cliente comprou:
- 1 Pijama Rosa GG (SKU: PSAPLWFGG) por R$ 67,41
- 1 Pijama Azul GG (SKU: PLALRGG) por R$ 80,91
- Frete: R$ 14,99
Total da venda: R$ 163,31
```

## 🔍 3. O sistema procura o custo

Para cada produto vendido, o sistema:

1. **Pega o SKU** do produto (PSAPLWFGG)
2. **Procura no banco** qual o custo desse SKU
3. **Encontra** que custa R$ 28,50

## 🧮 4. Calcula o lucro de cada item

Para cada produto vendido:

```
Pijama Rosa GG:
- Vendeu por: R$ 67,41
- Custou: R$ 28,50
- Lucro: R$ 38,91 ✅

Pijama Azul GG:
- Vendeu por: R$ 80,91  
- Custou: R$ 35,00
- Lucro: R$ 45,91 ✅
```

## 📊 5. Calcula o lucro total do pedido

```
Receita total: R$ 163,31
(-) Custo produtos: R$ 63,50 (28,50 + 35,00)
(-) Frete: R$ 14,99
(-) Investimento em anúncios: R$ XX,XX
(=) LUCRO LÍQUIDO: R$ XX,XX
```

## ⚠️ Problemas Comuns e Soluções

### ❌ Problema 1: SKU diferente

**E-commerce envia**: PSAPLWF-GG  
**Você cadastrou**: PSAPLWFGG  
**Resultado**: Sistema não acha o custo = assume R$ 0,00 ❌

**Solução**: SKU deve ser IDÊNTICO nos dois sistemas!

### ❌ Problema 2: Produto não cadastrado

**E-commerce envia**: CALCA123  
**Você cadastrou**: Não cadastrou ainda  
**Resultado**: Sistema assume custo R$ 0,00 ❌

**Solução**: Cadastre TODOS os produtos que vende!

### ❌ Problema 3: Custo desatualizado

**Cadastrado**: R$ 28,50 (preço antigo)  
**Custo atual**: R$ 35,00 (aumentou)  
**Resultado**: Lucro calculado errado ❌

**Solução**: Atualize os custos sempre que mudarem!

## 🎯 Exemplo Real Completo

### 1️⃣ Você cadastra:
```
Produto: Pijama Unicórnio Infantil
SKU: PIJUNI8
Custo: R$ 18,50
```

### 2️⃣ Cliente compra:
```
1x Pijama Unicórnio (PIJUNI8) = R$ 45,90
Frete = R$ 12,00
Total = R$ 57,90
```

### 3️⃣ Sistema calcula:
```
Vendeu por: R$ 45,90
Custou: R$ 18,50
Lucro do produto: R$ 27,40
Menos o frete: R$ 12,00
Lucro após frete: R$ 15,40
```

### 4️⃣ No dashboard você vê:
- **Vendas**: R$ 57,90
- **Custo produtos**: R$ 18,50
- **Frete**: R$ 12,00
- **Lucro**: R$ 27,40

## ✅ Checklist para Funcionar Corretamente

- [ ] Cadastrei TODOS os produtos que vendo
- [ ] Os SKUs estão IDÊNTICOS ao e-commerce
- [ ] Os custos estão ATUALIZADOS
- [ ] Testei enviando um pedido de teste

## 🚀 Como Cadastrar/Atualizar Produtos

### Opção 1: Pela API
```bash
POST /produtos
{
  "nome": "Pijama Novo",
  "sku": "PIJNOVO",
  "custo": 25.90
}
```

### Opção 2: Direto no banco
```bash
npx prisma studio
# Abrir tabela Produto e adicionar/editar
```

### Opção 3: Script em massa
Crie um arquivo com todos os produtos e rode um script de importação.

## 🔎 Como Verificar se Está Funcionando

1. **Envie um pedido de teste**
2. **Veja os logs** do sistema:
   ```
   [2025-07-09 10:30:45] Pedido aprovado - Código: 123 - Lucro: R$ 45,00
   ```
3. **Confira no dashboard** se o lucro aparece correto

## 💡 Dicas Importantes

1. **Sempre teste** com um pedido real após cadastrar produtos
2. **Revise os custos** mensalmente
3. **Use o mesmo padrão** de SKU sempre (com ou sem hífen, maiúsculas, etc)
4. **Monitore produtos** com custo zero no dashboard

## 📞 Precisa de Ajuda?

Se o custo não está sendo calculado:

1. Verifique se o produto está cadastrado
2. Compare o SKU letra por letra
3. Veja se o custo está preenchido
4. Teste com um pedido manual

---

💡 **Lembre-se**: O sucesso do cálculo depende de manter os produtos atualizados e com SKUs corretos!