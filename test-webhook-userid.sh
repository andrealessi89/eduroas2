#!/bin/bash

# ID do usuário de teste
USER_ID="cld123456789abcdef"

# URL do webhook com userId
WEBHOOK_URL="http://localhost:3001/pedidos/webhook/$USER_ID/ecommerce"

# Dados do pedido de teste (sem token, apenas dados da Magazord)
PEDIDO_JSON=$(cat <<EOF
{
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

echo "🔍 Testando webhook com userId na URL..."
echo "URL: $WEBHOOK_URL"
echo "User ID: $USER_ID"
echo ""

# Fazer a requisição
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PEDIDO_JSON" \
  -w "\n\nStatus HTTP: %{http_code}\n" \
  -v

echo ""
echo "✅ Teste concluído!"