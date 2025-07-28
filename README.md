# Dash Pro APP

Sistema completo de dashboard para e-commerce com análise de ROI (Return on Investment) e ROAS (Return on Ad Spend), integrando dados de vendas, custos de produtos e campanhas de marketing digital.

## 🚀 Funcionalidades Principais

### 📊 Dashboard Analítico
- **Métricas em Tempo Real**: Visualização de vendas, lucro, ROI e ROAS
- **Gráficos Interativos**: Análise de composição de custos e tendências
- **Filtros Avançados**: Por período, plataforma de ads e status
- **Cards de Performance**: Indicadores chave de desempenho (KPIs)
- **Avisos Inteligentes**: Alertas para produtos sem custo cadastrado

### 🛒 Gestão de Pedidos
- **Importação Automática**: Webhook integrado com Magazord
- **Cálculo Automático de Custos**: Busca custos via API do Magazord
- **Análise de Lucro**: Cálculo em tempo real de margem e lucro por pedido
- **Gestão de Produtos sem Custo**: Identificação e reprocessamento
- **Detalhamento Completo**: Visualização item a item com custos e lucros

### 💰 Integrações de Marketing

#### Meta Ads (Facebook/Instagram)
- **Multi-contas**: Suporte para múltiplas contas de anúncio
- **Importação Automática**: Dados de campanhas via API
- **Seleção de Contas**: Escolha quais contas monitorar
- **Métricas**: Custo, impressões, cliques, conversões
- **Cron Job**: Atualização automática diária

#### Google Ads
- **Geração de Tokens**: Sistema seguro de autenticação
- **Scripts Automatizados**: Geração automática de scripts para Google Ads
- **Webhook Dedicado**: Recebimento de dados em tempo real
- **Integração com Facebook**: Atualização simultânea de dados
- **Métricas Completas**: CPC, CPA, ROAS, conversões

### 🏪 Integração Magazord
- **Configuração Simples**: Usuário e chave de API
- **Busca de Custos**: API para obter custos de produtos automaticamente
- **Sincronização de Pedidos**: Webhook para pedidos aprovados
- **Reprocessamento**: Atualização de custos quando necessário
- **Validação**: Apenas pedidos aprovados são processados

### 🔐 Sistema de Autenticação
- **Login Seguro**: Autenticação com NextAuth e Google OAuth
- **Tokens de API**: Geração e gestão de tokens para integrações
- **Controle de Acesso**: Cada usuário acessa apenas seus dados
- **Sessões Persistentes**: Login mantido entre acessos

### 📱 Interface Responsiva
- **Mobile First**: Layout otimizado para dispositivos móveis
- **Menu Lateral**: Navegação intuitiva em desktop
- **Menu Inferior**: Navegação fácil em mobile
- **Tema Moderno**: Interface limpa e profissional com Tailwind CSS
- **Dark Mode Ready**: Preparado para tema escuro

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **Prisma ORM** para banco de dados
- **PostgreSQL** como banco de dados
- **JWT** para autenticação de API
- **Node-cron** para tarefas agendadas
- **Axios** para requisições HTTP
- **Date-fns** para manipulação de datas

### Frontend
- **Next.js 14** com App Router
- **React** com TypeScript
- **Tailwind CSS** para estilização
- **Recharts** para gráficos
- **NextAuth** para autenticação
- **Lucide Icons** para ícones
- **React Hook Form** para formulários

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- NPM ou Yarn
- Conta Magazord (para integração)
- Conta Meta Business (para Facebook Ads)
- Conta Google Ads (opcional)

## 🔧 Instalação Local

### 1. Clone o Repositório
```bash
git clone https://github.com/andrealessi89/eduroas2.git dashpro
cd dashpro
```

### 2. Configure o Backend

```bash
cd backend-webhook
npm install

# Crie o arquivo .env
cp .env.example .env
# Edite o arquivo com suas configurações

# Execute as migrations
npx prisma migrate dev

# Gere o Prisma Client
npx prisma generate

# Inicie o servidor
npm run dev
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install

# Crie o arquivo .env.local
cp .env.example .env.local
# Edite o arquivo com suas configurações

# Gere o Prisma Client
npx prisma generate

# Inicie o servidor
npm run dev
```

### 4. Acesse o Sistema
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🚀 Deploy em Produção

Consulte o arquivo [INSTALACAO_UBUNTU.md](INSTALACAO_UBUNTU.md) para um guia completo de instalação em servidor Ubuntu com:
- Configuração completa do servidor
- PM2 para gerenciamento de processos
- Nginx como proxy reverso
- SSL com Let's Encrypt
- Backup automatizado
- Monitoramento e logs

## 📱 Configuração das Integrações

### Magazord
1. Acesse Integrações → Magazord
2. Insira seu usuário e chave de API
3. Salve as configurações
4. Configure o webhook no Magazord para: `https://seu-dominio.com/pedidos/webhook/ecommerce`

### Meta Ads
1. Acesse Integrações → Meta Ads
2. Clique em "Nova Integração"
3. Insira um nome identificador
4. Cole o token de acesso do Meta Business
5. Salve e aguarde carregar as contas
6. Clique em "Gerenciar contas" e selecione as contas desejadas

### Google Ads
1. Acesse Integrações → Google Ads
2. Clique em "Gerar Novo Token"
3. Dê um nome ao token
4. Copie o script gerado
5. No Google Ads, vá em Ferramentas → Scripts
6. Cole o script e configure para executar diariamente

## 📊 Estrutura do Banco de Dados

### Principais Tabelas
- **users**: Usuários do sistema com autenticação Google
- **pedidos**: Pedidos importados do e-commerce
- **pedido_itens**: Itens detalhados dos pedidos
- **google_ads_data**: Dados diários do Google Ads
- **facebook_ads_data**: Dados diários do Facebook Ads
- **integracoes**: Configurações de todas as integrações
- **api_tokens**: Tokens de acesso para API

## 🔄 Fluxo de Dados

1. **Pedidos**: Magazord → Webhook → Busca Custos API → Cálculo → Dashboard
2. **Google Ads**: Script → Webhook → Banco de Dados → Dashboard
3. **Facebook Ads**: Cron Job → API Meta → Banco de Dados → Dashboard
4. **Dashboard**: Agrega todos os dados e calcula ROI/ROAS em tempo real

## 📈 Métricas Calculadas

### Financeiras
- **ROI**: (Lucro / Investimento Total) × 100
- **ROAS**: Receita / Custo com Ads
- **Margem de Lucro**: (Lucro / Receita) × 100
- **Ticket Médio**: Receita / Quantidade de Pedidos

### Marketing
- **CPA**: Custo por Aquisição
- **CTR**: Taxa de Cliques
- **CPC**: Custo por Clique
- **Taxa de Conversão**: Conversões / Cliques × 100

### Operacionais
- **Custo de Produto**: Soma dos custos unitários
- **Custo de Frete**: Total gasto com entregas
- **Desconto Médio**: Média de descontos aplicados

## 📡 API Endpoints

### Dashboard
- `GET /dashboard` - Dados completos com filtros
- `GET /dashboard/summary` - Resumo do dia

### Pedidos
- `GET /pedidos` - Listar com paginação
- `GET /pedidos/:id` - Detalhes do pedido
- `POST /pedidos/webhook/ecommerce` - Webhook Magazord
- `POST /pedidos/:id/reprocessar-custos` - Atualizar custos
- `GET /pedidos/sem-custo` - Pedidos com produtos sem custo

### Integrações
- `GET /integracoes` - Listar todas
- `POST /integracoes/magazord` - Salvar Magazord
- `GET /integracoes/meta` - Listar Meta Ads
- `POST /integracoes/meta` - Criar Meta Ads
- `PATCH /integracoes/meta/:id/accounts` - Selecionar contas
- `GET /integracoes/google-ads/tokens` - Listar tokens
- `POST /integracoes/google-ads/generate-token` - Gerar token

### Ads Data
- `GET /google-ads` - Dados Google Ads
- `GET /facebook-ads` - Dados Facebook Ads
- `POST /integracoes/google-ads/webhook` - Webhook Google

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT para autenticação de API
- OAuth 2.0 para login de usuários
- Validação de dados em todas as rotas
- Sanitização de inputs
- HTTPS em produção (recomendado)
- Rate limiting implementado
- CORS configurado

## 🧪 Desenvolvimento

### Scripts Disponíveis

Backend:
```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Compilar TypeScript
npm run start        # Produção
npm run seed:test    # Popular dados de teste
npm run test-webhook # Testar webhook
```

Frontend:
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servir produção
npm run lint         # Verificar código
```

### Estrutura de Pastas

```
dashpro/
├── backend-webhook/
│   ├── src/
│   │   ├── routes/       # Endpoints da API
│   │   ├── services/     # Lógica de negócio
│   │   ├── middleware/   # Autenticação, etc
│   │   ├── jobs/         # Tarefas agendadas
│   │   └── utils/        # Utilitários
│   └── prisma/
│       └── schema.prisma # Modelo do banco
├── frontend/
│   ├── src/
│   │   ├── app/          # Páginas Next.js
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilitários
│   └── public/           # Assets estáticos
└── docs/                 # Documentação
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript para type safety
- Siga as convenções do ESLint
- Escreva testes para novas features
- Documente funções complexas
- Mantenha componentes pequenos e reutilizáveis

## 📝 Changelog

### v1.0.0 (2025-01-28)
- Sistema completo de dashboard
- Integração com Magazord
- Integração com Meta Ads (multi-contas)
- Integração com Google Ads
- Cálculo automático de ROI/ROAS
- Interface responsiva
- Sistema de autenticação completo

## 📞 Suporte

Para suporte, envie um email para suporte@dashpro.com ou abra uma issue no GitHub.

### FAQ

**P: Como obter o token do Meta Ads?**
R: Acesse o Meta Business Suite → Configurações → Integrações de Negócios → Gerar Token

**P: O webhook não está funcionando, o que fazer?**
R: Verifique se o token está correto e se a URL está acessível publicamente

**P: Como calcular o custo dos produtos?**
R: O sistema busca automaticamente via API do Magazord usando o SKU

## 🎯 Roadmap

- [ ] Integração com Google Analytics 4
- [ ] Relatórios em PDF exportáveis
- [ ] App Mobile nativo (React Native)
- [ ] Integração com mais plataformas (Shopify, WooCommerce)
- [ ] Dashboard personalizado por usuário
- [ ] Sistema de alertas e notificações
- [ ] API pública documentada
- [ ] Modo offline com sincronização
- [ ] Análise preditiva com IA
- [ ] Integração com WhatsApp Business

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

## 👥 Equipe

- **André Alessi** - Fundador e Desenvolvedor Principal
- **Contribuidores** - Veja a lista completa no GitHub

---

**Dash Pro APP** - Transformando dados em decisões inteligentes 📊

Desenvolvido com ❤️ por André Alessi