#!/bin/bash

# Token de autenticação (substitua pelo token real)
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRtZzV5OXgwMDAwamxmbnZ3NGNubWY0IiwiaWF0IjoxNzI5MzUzOTkyLCJleHAiOjE3Mjk5NTg3OTJ9.wvPgFmLJO5DG-OZ1t4e9_xROoKJCdnJJmRdGGzPppnA"

# URL do webhook
WEBHOOK_URL="http://localhost:3001/webhook"

# Data de hoje
DATE=$(date +%Y-%m-%d)

# Dados do Google Ads
PAYLOAD=$(cat <<EOF
{
  "date": "$DATE",
  "accountId": "402-354-2791",
  "accountName": "Conta Teste",
  "cost": 250.50,
  "impressions": 8000,
  "clicks": 320,
  "conversions": 15.5,
  "averageCpc": 0.78,
  "conversionValue": 2800.00
}
EOF
)

echo "🚀 Enviando webhook para: $WEBHOOK_URL"
echo "📅 Data: $DATE"
echo "📊 Payload:"
echo "$PAYLOAD" | jq .
echo ""

# Enviar webhook
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "$PAYLOAD" \
  -w "\n\n✅ Status HTTP: %{http_code}\n" \
  -v

echo ""
echo "🏁 Teste concluído!"