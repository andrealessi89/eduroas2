const axios = require('axios');

// Configurações do teste
const WEBHOOK_URL = 'http://localhost:3001/pedidos/webhook/ecommerce';
const TOKEN = 'cld123456789abcdef'; // Substitua pelo token real

// Dados de exemplo de um pedido aprovado (situação 4)
const pedidoTeste = {
  token: TOKEN,
  id: 123456,
  codigo: 'TEST-001',
  pedidoSituacao: 4,
  pedidoSituacaoDescricao: 'Aprovado',
  dataHora: new Date().toISOString(),
  valorProduto: '100.00',
  valorFrete: '10.00',
  valorDesconto: '0.00',
  valorTotal: '110.00',
  pessoaNome: 'Cliente Teste',
  pessoaEmail: 'teste@exemplo.com',
  formaPagamentoNome: 'Cartão de Crédito',
  arrayPedidoRastreio: [
    {
      pedidoItem: [
        {
          produtoDerivacaoId: 1,
          produtoDerivacaoCodigo: 'PROD-001',
          descricao: 'Produto Teste',
          quantidade: 2,
          valorUnitario: '50.00',
          valorDesconto: '0.00',
          valorItem: '100.00'
        }
      ]
    }
  ]
};

// Função para testar o webhook
async function testarWebhook() {
  console.log('Testando webhook...');
  console.log('URL:', WEBHOOK_URL);
  console.log('Token:', TOKEN);
  
  try {
    const response = await axios.post(WEBHOOK_URL, pedidoTeste, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Resposta do webhook:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Erro ao testar webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar teste
testarWebhook();