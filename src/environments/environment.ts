import { firebaseConfig } from './firebase.config';

export const environment = {
  production: false,
  
  // Configurações da API Backend
  apiUrl: 'http://localhost:3000',
  
  // Configurações do Firebase
  firebase: firebaseConfig,
  
  // Configurações do ASAAS (será usado pelo backend)
  asaas: {
    apiKey: process.env['NG_APP_ASAAS_API_KEY'] || '',
    environment: process.env['NG_APP_ASAAS_ENVIRONMENT'] || 'sandbox',
    baseUrl: process.env['NG_APP_ASAAS_BASE_URL'] || 'https://api-sandbox.asaas.com/',
    webhookUrl: process.env['NG_APP_ASAAS_WEBHOOK_URL'] || 'http://localhost:3000/webhook/asaas'
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: 'http://localhost:4200/payment-success',
    cancelUrl: 'http://localhost:4200/booking'
  }
};
