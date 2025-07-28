# Guia de Instalação - Dash Pro APP no Ubuntu

Este guia detalha o processo completo de instalação do Dash Pro APP em um servidor Ubuntu.

## Pré-requisitos

- Ubuntu 20.04 LTS ou superior
- Acesso root ou sudo
- Mínimo 2GB RAM
- 20GB de espaço em disco
- Domínio configurado (opcional, mas recomendado)

## 1. Atualizar o Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Instalar Node.js e npm

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Acessar o PostgreSQL
sudo -u postgres psql

# Criar banco de dados e usuário
CREATE DATABASE dashpro;
CREATE USER dashpro_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE dashpro TO dashpro_user;
\q

# Sair do usuário postgres
exit
```

## 4. Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## 5. Instalar Nginx

```bash
sudo apt install -y nginx
```

## 6. Clonar o Projeto

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
cd /var/www

# Clonar o repositório
sudo git clone https://github.com/andrealessi89/eduroas2.git dashpro
cd dashpro

# Definir permissões
sudo chown -R $USER:$USER /var/www/dashpro
```

## 7. Configurar o Backend

```bash
cd /var/www/dashpro/backend-webhook

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

Adicione o seguinte conteúdo ao arquivo `.env`:

```env
# Banco de dados
DATABASE_URL="postgresql://dashpro_user:sua_senha_segura@localhost:5432/dashpro"

# Porta do servidor
PORT=3001

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET="sua_chave_secreta_muito_segura_aqui"

# Ambiente
NODE_ENV=production
```

Salve e feche o arquivo (Ctrl+X, Y, Enter).

```bash
# Executar migrations do Prisma
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Compilar TypeScript
npm run build

# Testar se está funcionando
npm start
```

## 8. Configurar o Frontend

```bash
cd /var/www/dashpro/frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
nano .env.local
```

Adicione o seguinte conteúdo:

```env
# URL da API (ajuste conforme seu domínio)
NEXT_PUBLIC_API_URL=http://seu-dominio.com:3001

# NextAuth
NEXTAUTH_URL=http://seu-dominio.com
NEXTAUTH_SECRET="sua_chave_secreta_nextauth"

# Banco de dados (mesmo do backend)
DATABASE_URL="postgresql://dashpro_user:sua_senha_segura@localhost:5432/dashpro"
```

```bash
# Gerar cliente Prisma
npx prisma generate

# Compilar o projeto
npm run build

# Testar se está funcionando
npm start
```

## 9. Configurar PM2

Criar arquivo de configuração PM2:

```bash
cd /var/www/dashpro
nano ecosystem.config.js
```

Adicione o seguinte conteúdo:

```javascript
module.exports = {
  apps: [
    {
      name: 'dashpro-backend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/dashpro/backend-webhook',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'dashpro-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/dashpro/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

Iniciar aplicações com PM2:

```bash
# Iniciar todas as aplicações
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que o PM2 sugerir
```

## 10. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/dashpro
```

Adicione a seguinte configuração:

```nginx
# Frontend
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar o site:

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/dashpro /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 11. Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22

# Permitir HTTP e HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Permitir porta da API (se necessário acesso direto)
sudo ufw allow 3001

# Ativar firewall
sudo ufw enable
```

## 12. Instalar SSL com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Renovação automática já é configurada
```

## 13. Criar Usuário Inicial

```bash
cd /var/www/dashpro/backend-webhook

# Criar arquivo seed para usuário inicial
nano prisma/seed-user.ts
```

Adicione:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@dashpro.com',
      name: 'Administrador',
      password: hashedPassword,
      isActive: true,
    },
  });
  
  console.log('Usuário criado:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:

```bash
npx ts-node prisma/seed-user.ts
```

## 14. Monitoramento

Comandos úteis do PM2:

```bash
# Ver status das aplicações
pm2 status

# Ver logs
pm2 logs

# Ver logs específicos
pm2 logs dashpro-backend
pm2 logs dashpro-frontend

# Reiniciar aplicação
pm2 restart dashpro-backend
pm2 restart dashpro-frontend

# Monitorar recursos
pm2 monit
```

## 15. Backup Automatizado

Criar script de backup:

```bash
sudo nano /usr/local/bin/backup-dashpro.sh
```

Adicione:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/dashpro"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="dashpro"
DB_USER="dashpro_user"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
PGPASSWORD="sua_senha_segura" pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remover backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

Tornar executável e agendar:

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-dashpro.sh

# Adicionar ao cron (backup diário às 2h)
sudo crontab -e
# Adicione a linha:
0 2 * * * /usr/local/bin/backup-dashpro.sh
```

## Solução de Problemas

### Erro de conexão com banco de dados

1. Verifique se o PostgreSQL está rodando:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verifique as credenciais no arquivo `.env`

3. Teste a conexão:
   ```bash
   psql -U dashpro_user -d dashpro -h localhost
   ```

### Aplicação não inicia

1. Verifique os logs do PM2:
   ```bash
   pm2 logs
   ```

2. Verifique se as portas estão livres:
   ```bash
   sudo netstat -tlpn | grep -E '3000|3001'
   ```

### Nginx retorna 502 Bad Gateway

1. Verifique se as aplicações estão rodando:
   ```bash
   pm2 status
   ```

2. Verifique os logs do Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Manutenção

### Atualizar o sistema

```bash
cd /var/www/dashpro
git pull origin main

# Backend
cd backend-webhook
npm install
npx prisma migrate deploy
npm run build
pm2 restart dashpro-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart dashpro-frontend
```

### Limpar logs antigos

```bash
# PM2
pm2 flush

# Nginx
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log
```

## Segurança Adicional

1. **Desabilitar login root SSH**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Definir: PermitRootLogin no
   sudo systemctl restart sshd
   ```

2. **Instalar Fail2ban**:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Manter sistema atualizado**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Contato e Suporte

Em caso de dúvidas ou problemas, consulte:
- Documentação: https://github.com/andrealessi89/eduroas2
- Issues: https://github.com/andrealessi89/eduroas2/issues