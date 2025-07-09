# Sistema EDU

Sistema de gestão educacional com autenticação Google e controle de acesso baseado em banco de dados.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **Prisma** - ORM para PostgreSQL
- **NextAuth.js** - Autenticação com Google OAuth
- **PostgreSQL** - Banco de dados relacional

## 📋 Funcionalidades

- ✅ Autenticação com Google OAuth
- ✅ Controle de usuários ativos/inativos
- ✅ Dashboard protegido por autenticação
- ✅ Middleware de proteção de rotas
- ✅ Sistema de sessões seguro

## 🏗️ Estrutura do Projeto

```
sistemaedu/
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/      # Rotas de autenticação
│   │   ├── dashboard/     # Página do dashboard
│   │   ├── login/         # Página de login
│   │   ├── layout.tsx     # Layout principal
│   │   ├── page.tsx       # Página inicial
│   │   └── providers.tsx  # Provider de sessão
│   ├── lib/
│   │   ├── auth.ts        # Configuração NextAuth
│   │   └── prisma.ts      # Cliente Prisma
│   ├── types/
│   │   └── next-auth.d.ts # Tipos TypeScript
│   └── middleware.ts      # Middleware de autenticação
├── .env                   # Variáveis de ambiente
└── package.json
```

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone [seu-repositorio]
cd sistemaedu
```

### 2. Instale as dependências

```bash
cd sistemaedu
npm install
```

### 3. Inicie o banco de dados com Docker

```bash
# Na raiz do projeto (não dentro de sistemaedu)
docker-compose up -d

# Ou use o Makefile
make up
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sistemaedu?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3333"
NEXTAUTH_SECRET="gere-uma-chave-secreta-com-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="seu-client-id-do-google"
GOOGLE_CLIENT_SECRET="seu-client-secret-do-google"
```

### 5. Configure o Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API Google+ 
4. Em "Credenciais", crie um "ID do cliente OAuth 2.0"
5. Configure as URIs autorizadas:
   - JavaScript origins: `http://localhost:3333`
   - Redirect URIs: `http://localhost:3333/api/auth/callback/google`
6. Copie o Client ID e Client Secret para o `.env`

### 6. Execute as migrations do banco

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. Adicione usuários autorizados

Use o Prisma Studio para adicionar usuários:

```bash
npx prisma studio
```

Ou crie um script seed:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      email: 'usuario@exemplo.com',
      name: 'Usuário Teste',
      isActive: true,
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## 🚀 Executando o Projeto

```bash
npm run dev
```

Acesse http://localhost:3333

## 📱 Fluxo de Autenticação

1. Usuário acessa a aplicação
2. É redirecionado para `/login`
3. Clica em "Entrar com Google"
4. Faz login com sua conta Google
5. Sistema verifica se o email está cadastrado e ativo
6. Se autorizado, é redirecionado para `/dashboard`
7. Se não autorizado, retorna erro

## 🔒 Segurança

- Apenas usuários com `isActive = true` podem acessar o sistema
- Todas as rotas (exceto `/login`) são protegidas por middleware
- Sessões são gerenciadas de forma segura pelo NextAuth
- Tokens JWT são usados para manter a sessão

## 🛠️ Comandos Úteis

### Docker & Banco de Dados
```bash
# Iniciar banco de dados
make up
# ou
docker-compose up -d

# Parar banco de dados
make down
# ou
docker-compose down

# Ver logs do banco
make logs
# ou
docker-compose logs -f postgres

# Limpar banco (REMOVE TODOS OS DADOS)
make db-clean
```

### Desenvolvimento
```bash
# Setup inicial completo (banco + migrations)
make setup

# Desenvolvimento
make dev
# ou
npm run dev

# Build
npm run build

# Produção
npm start
```

### Prisma
```bash
# Prisma Studio (gerenciar banco)
make studio
# ou
npx prisma studio

# Executar migrations
make migrate
# ou
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# Deploy migrations
npx prisma migrate deploy
```

## 📝 Modelos do Banco de Dados

### User
- `id`: Identificador único
- `email`: Email do usuário (único)
- `name`: Nome do usuário
- `image`: URL da imagem de perfil
- `isActive`: Status ativo/inativo
- `emailVerified`: Data de verificação do email
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### Account
- Gerencia as contas OAuth conectadas

### Session
- Gerencia as sessões ativas dos usuários

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.