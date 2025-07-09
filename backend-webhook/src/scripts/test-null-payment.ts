import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function testWebhook() {
  try {
    // Ler o arquivo JSON de teste
    const testDataPath = path.join(__dirname, '../../test-order.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
    
    // Criar uma cópia dos dados e remover o campo formaPagamentoNome para testar
    const testDataWithoutPayment = { ...testData };
    testDataWithoutPayment.formaPagamentoNome = null;
    
    // Token de teste - você precisa substituir por um token válido
    const token = 'YOUR_API_TOKEN_HERE';
    
    const response = await axios.post('http://localhost:3001/api/webhooks/magazord/pedido', testDataWithoutPayment, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook processado com sucesso!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar o teste
testWebhook();