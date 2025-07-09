# Backend Webhook - Sistema EDU

Backend Node.js para receber dados do Google Ads via webhook.

## Instalação

```bash
npm install
npx prisma migrate dev
```

## Configuração

1. Configure o arquivo `.env`:
```env
DATABASE_URL="postgresql://sistemaedu:sistema123@localhost:5432/sistemaedu"
PORT=3001
NODE_ENV=development
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## Gerar Token de API

Para gerar um token para um usuário:

```bash
npm run generate-token email@usuario.com "Nome do Token"
```

## Endpoint Webhook

- **URL**: `POST http://localhost:3001/webhook`
- **Header**: `Authorization: Bearer SEU_TOKEN_AQUI`
- **Body**: JSON com os dados do Google Ads

## Script Google Ads

Use este script no Google Ads, substituindo o token:

```javascript
// === CONFIGURAÇÃO ===
const BACKEND_URL   = 'http://SEU_IP:3001/webhook';
const BACKEND_TOKEN = 'TOKEN_GERADO_AQUI';

function main() {
  const acct   = AdsApp.currentAccount();
  const stats  = acct.getStatsFor('TODAY');
  const today  = new Date().toISOString().slice(0,10);

  // GaQL para pegar conversionValue
  const report = AdsApp.report(
    `SELECT metrics.conversion_value 
     FROM customer 
     WHERE segments.date = '${today}'`
  );
  const rows = report.rows();
  const conversionValue = rows.hasNext() 
    ? parseFloat(rows.next()['metrics.conversionValue']) 
    : 0;

  const payload = {
    date:            today,
    accountId:       acct.getCustomerId(),
    accountName:     acct.getName(),
    cost:            stats.getCost(),
    impressions:     stats.getImpressions(),
    clicks:          stats.getClicks(),
    conversions:     stats.getConversions(),
    averageCpc:      Number(stats.getAverageCpc().toFixed(2)),
    conversionValue: conversionValue
  };

  UrlFetchApp.fetch(BACKEND_URL, {
    method:      'post',
    contentType: 'application/json',
    headers:     { Authorization: 'Bearer ' + BACKEND_TOKEN },
    payload:     JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log('Payload enviado:\n' + JSON.stringify(payload, null, 2));
}
```