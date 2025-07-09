#!/bin/bash

# Teste do webhook com dados simulados

TOKEN="cmcv96uuh0003i20buln9hopu"  # Token gerado anteriormente
URL="http://localhost:3001/webhook"
DATE=$(date +%Y-%m-%d)

echo "Testando webhook..."
echo "URL: $URL"
echo "Token: Bearer $TOKEN"
echo "Data: $DATE"
echo ""

curl -X POST $URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "'$DATE'",
    "accountId": "123-456-7890",
    "accountName": "Conta Teste Google Ads",
    "cost": 125.50,
    "impressions": 5420,
    "clicks": 342,
    "conversions": 28.5,
    "averageCpc": 0.37,
    "conversionValue": 892.30
  }' -v

echo ""
echo "Teste concluído!"