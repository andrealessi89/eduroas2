# Sistema EDU - ROAS Manager

Sistema de gerenciamento de ROAS (Return on Ad Spend) para e-commerce, integrando dados de vendas com campanhas de marketing digital.

## 📋 Visão Geral

O Sistema EDU é uma plataforma completa para análise de performance de campanhas de marketing digital, calculando o retorno real sobre investimento em anúncios considerando todos os custos envolvidos na operação.

### Principais Funcionalidades

- ✅ **Dashboard Analítico**: Visualização em tempo real de métricas de performance
- ✅ **Integração Multi-plataforma**: Google Ads e Facebook Ads
- ✅ **Webhook E-commerce**: Recebimento automático de pedidos
- ✅ **Cálculo de Lucro Real**: Considera custos de produtos, frete e investimento em ads
- ✅ **Filtros Avançados**: Por data, plataforma e período
- ✅ **Autenticação Segura**: Google OAuth com controle de acesso
- ✅ **Gestão de Produtos**: CRUD completo com interface intuitiva
- ✅ **Sistema de Integrações**: Configuração de credenciais Magazord e geração de tokens API
- ✅ **Interface Responsiva**: Menu lateral colapsável com navegação intuitiva

## 🏗️ Arquitetura do Sistema

### Backend (API) - `/backend-webhook`
- **Framework**: Express.js com TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: Bearer Token
- **Porta**: 3001

### Frontend - `/frontend`
- **Framework**: Next.js 15 com App Router
- **UI**: Tailwind CSS v4
- **Charts**: Recharts
- **Autenticação**: NextAuth.js com Google OAuth
- **Porta**: 3333
- **Componentes**: Modal system, Layout responsivo, Tabs

## 📊 Estrutura de Dados

### Tabelas Principais

#### 1. **User**
```prisma
- id: String @id
- email: String @unique
- name: String?
- isActive: Boolean @default(false)
- apiTokens: ApiToken[]
- googleAdsData: GoogleAdsData[]
- facebookAdsData: FacebookAdsData[]
- produtos: Produto[]
- pedidos: Pedido[]
- integracoes: Integracao[]
```

#### 2. **Produto**
```prisma
- id: String
- userId: String
- nome: String
- sku: String (único por usuário)
- custo: Float
```

#### 3. **Pedido**
```prisma
- id: String
- codigo: String (único)
- idPedido: String
- dataHora: DateTime
- valorProduto: Float
- valorFrete: Float
- valorDesconto: Float
- valorTotal: Float
- pessoaNome: String
- pessoaEmail: String
- formaPagamento: String
- situacao: Int
- situacaoDescricao: String
- cupomCodigo: String?
- cupomDesconto: Float
- itens: PedidoItem[]
```

#### 4. **PedidoItem**
```prisma
- id: String
- pedidoId: String
- produtoDerivacaoCodigo: String (SKU)
- produtoNome: String
- quantidade: Int
- valorUnitario: Float
- valorDesconto: Float
- valorItem: Float
- custoUnitario: Float
- lucroItem: Float
```

#### 5. **GoogleAdsData / FacebookAdsData**
```prisma
- id: String
- userId: String
- date: String
- accountId: String
- accountName: String
- cost: Float
- impressions: Int
- clicks: Int
- conversions: Float
- averageCpc: Float
- conversionValue: Float
```

#### 6. **Integracao**
```prisma
- id: String
- userId: String
- tipo: String ('magazord', 'google', 'facebook')
- nome: String
- config: Json (credenciais e configurações)
- isActive: Boolean
- @@unique([userId, tipo])
```

#### 7. **ApiToken**
```prisma
- id: String
- token: String @unique
- userId: String
- name: String
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

## 🔧 Regras de Negócio

### 1. **Processamento de Pedidos**
- ✅ **Apenas pedidos aprovados**: Somente `situacao = 4` são processados
- ✅ **Sem duplicação**: Verificação pelo campo `codigo` único
- ✅ **Cálculo automático**: 
  - Custo baseado no SKU do produto cadastrado
  - Lucro por item: `valorItem - (custoUnitario × quantidade)`
- ✅ **Webhook único**: Cada pedido é processado apenas uma vez

### 2. **Cálculos do Dashboard**

#### ROAS (Return on Ad Spend)
```
ROAS Geral = Vendas Totais / Investimento Total em Ads
ROAS Google = Vendas Google / Investimento Google
ROAS Facebook = Vendas Facebook / Investimento Facebook
```

#### Lucro Líquido
```
Lucro = Receita - Custo dos Produtos - Frete - Investimento em Ads
```

#### Margens
- **Margem Bruta**: `(Receita - Custo Produtos) / Receita × 100`
- **Margem Líquida**: `Lucro Líquido / Receita × 100`
- **Margem de Contribuição**: `(Receita - Custos Variáveis) / Receita × 100`

#### Métricas de Performance
- **CPC (Custo por Clique)**: `Investimento / Cliques`
- **CPA (Custo por Aquisição)**: `Investimento / Conversões`
- **Taxa de Conversão**: `Conversões / Cliques × 100`
- **Ticket Médio**: `Valor Total Pedidos / Quantidade Pedidos`

### 3. **Filtros e Agregações**
- Filtro por período (data inicial e final)
- Filtro por plataforma (Google, Facebook, Todas)
- Agregação de dados por dia, semana ou mês
- Separação entre pedidos totais e aprovados

### 4. **Sistema de Integrações**
- **Magazord**: Armazenamento seguro de credenciais (user/key)
- **Tokens API**: Geração e gestão de tokens para autenticação
- **Segurança**: Credenciais criptografadas, tokens únicos
- **Interface**: Tabs separadas para cada tipo de integração

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- NPM ou Yarn
- Docker (opcional, para o banco de dados)

### 1. Backend Setup

```bash
cd backend-webhook

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com:
# DATABASE_URL=postgresql://user:password@localhost:5432/sistemaedu_db
# PORT=3001

# Executar migrations
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Popular dados de teste (produtos, ads data)
npm run seed

# Gerar token de API para seu usuário
npm run generate-token seu-email@gmail.com

# Iniciar servidor de desenvolvimento
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Adicionar:
# DATABASE_URL=postgresql://user:password@localhost:5432/sistemaedu_db
# NEXTAUTH_URL=http://localhost:3333
# NEXTAUTH_SECRET=sua-chave-secreta
# GOOGLE_CLIENT_ID=seu-client-id
# GOOGLE_CLIENT_SECRET=seu-client-secret
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Gerar Prisma Client
npx prisma generate

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📡 Endpoints da API

### Autenticação
Todas as rotas requerem header `Authorization: Bearer <token>`

### Dashboard
- `GET /dashboard` - Dados completos do dashboard com filtros
  - Query params: `startDate`, `endDate`, `platform`
- `GET /dashboard/summary` - Resumo de métricas do dia

### Produtos
- `GET /produtos` - Listar todos os produtos
- `GET /produtos/:id` - Buscar produto específico
- `POST /produtos` - Criar novo produto
  ```json
  {
    "nome": "Produto",
    "sku": "SKU123",
    "custo": 29.90
  }
  ```
- `PUT /produtos/:id` - Atualizar produto
- `DELETE /produtos/:id` - Deletar produto

### Pedidos
- `GET /pedidos` - Listar pedidos com filtros
  - Query params: `startDate`, `endDate`, `limit`, `offset`
- `POST /pedidos/webhook/ecommerce` - Webhook para receber pedidos
- `GET /pedidos/stats/aggregated` - Estatísticas agregadas

### Ads Data
- `POST /webhook` - Receber dados do Google Ads
- `POST /facebook-ads` - Receber dados do Facebook Ads
- `GET /facebook-ads` - Listar dados com filtros
- `GET /facebook-ads/aggregated` - Dados agregados

## 🔐 Segurança

### Autenticação em Duas Camadas
1. **Frontend**: Google OAuth via NextAuth.js
2. **Backend**: Bearer Token com validação no banco

### Validações Implementadas
- ✅ Validação de tipos com TypeScript
- ✅ Validação de campos obrigatórios
- ✅ Verificação de token ativo
- ✅ Verificação de usuário ativo
- ✅ Proteção contra duplicação de dados
- ✅ Middleware de autenticação em todas as rotas

## 📈 Webhook E-commerce

### Estrutura Esperada do Payload
```json
{
  "id": 71309,
  "codigo": "0012507422480",
  "dataHora": "2025-07-09 00:29:30-03",
  "valorProduto": "164.80",
  "valorFrete": "14.99",
  "valorDesconto": "16.48",
  "valorTotal": "163.31",
  "pessoaNome": "Cliente Nome",
  "pessoaEmail": "cliente@email.com",
  "formaPagamentoNome": "Cartão - MasterCard",
  "pedidoSituacao": 4,
  "pedidoSituacaoDescricao": "Crédito e Cadastro Aprovados",
  "cupomCodigo": "DESC10",
  "cupomValorDesconto": "16.48",
  "arrayPedidoRastreio": [{
    "pedidoItem": [{
      "produtoDerivacaoId": 443,
      "produtoDerivacaoCodigo": "SKU123",
      "descricao": "Produto Descrição",
      "quantidade": 1,
      "valorUnitario": 74.90,
      "valorDesconto": 7.49,
      "valorItem": 67.41
    }]
  }]
}
```

### Fluxo de Processamento
1. **Validação**: Verifica se `pedidoSituacao === 4`
2. **Duplicidade**: Verifica se o código já existe
3. **Busca de Custos**: Localiza produtos pelo SKU
4. **Cálculo**: Determina custo e lucro por item
5. **Persistência**: Salva pedido e itens relacionados
6. **Resposta**: Retorna resumo do processamento

## 🧪 Testes

### Gerar Token de API
```bash
cd backend-webhook
npm run generate-token usuario@email.com
```

### Testar Webhook de Pedido
```bash
# Com script de teste
npm run test-webhook <TOKEN>

# Com cURL
curl -X POST http://localhost:3001/pedidos/webhook/ecommerce \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d @test-order.json
```

### Testar Google Ads Webhook
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "data": [{
      "date": "2025-07-09",
      "accountId": "123-456-7890",
      "accountName": "Minha Conta",
      "cost": 150.00,
      "impressions": 5000,
      "clicks": 200,
      "conversions": 10,
      "averageCpc": 0.75,
      "conversionValue": 1500.00
    }]
  }'
```

## 📊 Métricas e KPIs

### Dashboard Principal
- **Lucro Líquido**: Valor final após todos os custos
- **ROAS Geral**: Eficiência do investimento em marketing
- **Pedidos**: Total e aprovados
- **Ticket Médio**: Valor médio por compra
- **Margem de Lucro**: Percentual de lucro sobre vendas

### Por Plataforma
- **Investimento**: Quanto foi gasto
- **Vendas Geradas**: Valor de conversão
- **ROAS Individual**: Retorno de cada plataforma
- **CPC/CPA**: Custos de aquisição
- **Taxa de Conversão**: Eficiência das campanhas

### Distribuição de Custos
- **Produtos**: Custo de mercadoria vendida
- **Frete**: Custos de entrega
- **Marketing**: Investimento em ads
- **Lucro**: Margem final

## 🔄 Fluxo de Dados

```mermaid
graph LR
    A[Google Ads] --> B[Webhook API]
    C[Facebook Ads] --> B
    D[E-commerce] --> E[Webhook Pedidos]
    B --> F[Database]
    E --> F
    F --> G[Dashboard API]
    G --> H[Frontend Dashboard]
```

## 🛠️ Manutenção e Monitoramento

### Logs do Sistema
- Formato: `[YYYY-MM-DD HH:mm:ss] Ação - Usuário - Detalhes`
- Webhooks recebidos são logados
- Erros são capturados e registrados

### Comandos Úteis
```bash
# Ver logs do Prisma
npx prisma studio

# Verificar status das migrations
npx prisma migrate status

# Reset do banco (CUIDADO: apaga tudo)
npx prisma migrate reset
```

### Performance
- Dashboard otimizado para até 100k registros
- Índices criados para queries frequentes
- Agregações pré-calculadas para métricas

## 📝 Notas Importantes

1. **SKUs**: Devem corresponder EXATAMENTE entre sistema e e-commerce
2. **Custos**: Manter produtos atualizados para cálculos precisos
3. **Timezone**: Sistema usa horário de Brasília (America/Sao_Paulo)
4. **Pedidos**: Apenas situação 4 (aprovados) são considerados
5. **Tokens**: Cada usuário deve ter seu próprio token de API

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do sistema
2. Confirme as configurações de ambiente
3. Valide os tokens de API
4. Verifique a estrutura dos webhooks

## 📄 Licença

Este projeto é privado e confidencial.