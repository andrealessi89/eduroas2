#!/bin/bash

# ID do usuário real
USER_ID="cmdmg5y9x0000jlfnvw4cnmf4"

# URL do webhook em produção
WEBHOOK_URL="https://api.dashproapp.com.br/pedidos/webhook/$USER_ID/ecommerce"

# Dados do pedido completo da Magazord
PEDIDO_JSON=$(cat <<EOF
{
  "id": 123456,
  "codigo": "PROD-TEST-001",
  "pedidoSituacao": 4,
  "pedidoSituacaoDescricao": "Aprovado",
  "dataHora": "2025-07-28T13:45:00",
  "valorProduto": "100.00",
  "valorFrete": "10.00",
  "valorDesconto": "0.00",
  "valorTotal": "110.00",
  "pessoaNome": "Cliente Teste",
  "pessoaEmail": "teste@exemplo.com",
  "formaPagamentoNome": "Cartão de Crédito",
  "cupomCodigo": null,
  "cupomValorDesconto": null,
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

echo "🔍 Testando webhook em produção..."
echo "URL: $WEBHOOK_URL"
echo "User ID: $USER_ID"
echo ""

# Fazer a requisição
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PEDIDO_JSON" \
  -w "\n\nStatus HTTP: %{http_code}\n"

echo ""
echo "✅ Teste concluído!"