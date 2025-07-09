# Guia de Configuração Rápida

## ✅ Problema Resolvido

O erro de conexão com o banco foi corrigido. O arquivo `.env` dentro da pasta `sistemaedu` estava com uma configuração incorreta do Prisma.

## 🚀 Como iniciar o projeto

### 1. Iniciar o banco de dados PostgreSQL
```bash
# Na raiz do projeto (não dentro de sistemaedu)
docker-compose up -d
```

### 2. Verificar se o banco está rodando
```bash
docker ps
# Deve mostrar: sistemaedu-postgres rodando na porta 5432
```

### 3. Criar as tabelas no banco
```bash
cd sistemaedu
npx prisma db push
```

### 4. Adicionar um usuário autorizado
```bash
# Substitua o email pelo seu email do Google
docker exec sistemaedu-postgres psql -U sistemaedu -d sistemaedu_db -c "INSERT INTO \"User\" (id, email, name, \"isActive\", \"createdAt\", \"updatedAt\") VALUES ('clz123456789abcdef', 'seu-email@gmail.com', 'Seu Nome', true, NOW(), NOW());"
```

### 5. Configurar Google OAuth
1. Acesse https://console.cloud.google.com
2. Configure as credenciais OAuth
3. Atualize o arquivo `sistemaedu/.env` com:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_SECRET (gere com: `openssl rand -base64 32`)

### 6. Iniciar o servidor
```bash
cd sistemaedu
npm run dev
```

## 📝 Usuário de teste criado

- **Email:** admin@example.com
- **Nome:** Admin User
- **Status:** Ativo

## 🔍 Comandos úteis

### Verificar tabelas do banco
```bash
docker exec sistemaedu-postgres psql -U sistemaedu -d sistemaedu_db -c "\dt"
```

### Listar usuários cadastrados
```bash
docker exec sistemaedu-postgres psql -U sistemaedu -d sistemaedu_db -c "SELECT email, name, \"isActive\" FROM \"User\";"
```

### Adicionar novo usuário
```bash
docker exec sistemaedu-postgres psql -U sistemaedu -d sistemaedu_db -c "INSERT INTO \"User\" (id, email, name, \"isActive\", \"createdAt\", \"updatedAt\") VALUES ('novo-id-unico', 'email@gmail.com', 'Nome', true, NOW(), NOW());"
```

### Ativar/Desativar usuário
```bash
# Desativar
docker exec sistemaedu-postgres psql -U sistemaedu -d sistemaedu_db -c "UPDATE \"User\" SET \"isActive\" = false WHERE email = 'email@gmail.com';"

# Ativar
docker exec sistemaedu-postgres psql -U sistemaedu -d sistemaedu_db -c "UPDATE \"User\" SET \"isActive\" = true WHERE email = 'email@gmail.com';"
```