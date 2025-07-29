#!/bin/bash

# URL do webhook
WEBHOOK_URL="http://localhost:3001/pedidos/webhook/ecommerce"

# Token de teste
TOKEN="cld123456789abcdef"

# Dados do pedido de teste
PEDIDO_JSON=$(cat <<EOF
{
  "token": "$TOKEN",
  "id": 123456,
  "codigo": "TEST-001",
  "pedidoSituacao": 4,
  "pedidoSituacaoDescricao": "Aprovado",
  "dataHora": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "valorProduto": "100.00",
  "valorFrete": "10.00",
  "valorDesconto": "0.00",
  "valorTotal": "110.00",
  "pessoaNome": "Cliente Teste",
  "pessoaEmail": "teste@exemplo.com",
  "formaPagamentoNome": "Cartão de Crédito",
  "arrayPedidoRastreio": [
    {
      "pedidoItem": [
        {
          "produtoDerivacaoId": 1,
          "produtoDerivacaoCodigo": "PROD-001",
          "descricao": "Produto Teste",
          "quantidade": 2,
          "valorUnitario": "50.00",
          "valorDesconto": "0.00",
          "valorItem": "100.00"
        }
      ]
    }
  ]
}
EOF
)

echo "🔍 Testando webhook..."
echo "URL: $WEBHOOK_URL"
echo "Token: $TOKEN"
echo ""

# Fazer a requisição
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PEDIDO_JSON" \
  -w "\n\nStatus HTTP: %{http_code}\n" \
  -v

echo ""
echo "✅ Teste concluído!"