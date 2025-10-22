import { firebaseConfig } from './firebase.config';

export const environment = {
  production: false,
  
  // Configurações da API Backend
  apiUrl: (globalThis as any)['NG_APP_API_URL'] || 'http://localhost:3000',
  
  // Configurações do Firebase
  firebase: firebaseConfig,
  
  // Configurações do ASAAS (será usado pelo backend)
  asaas: {
    apiKey: (globalThis as any)['NG_APP_ASAAS_API_KEY'] || '',
    environment: (globalThis as any)['NG_APP_ASAAS_ENVIRONMENT'] || 'sandbox',
    baseUrl: (globalThis as any)['NG_APP_ASAAS_BASE_URL'] || 'https://api-sandbox.asaas.com/',
    webhookUrl: (globalThis as any)['NG_APP_ASAAS_WEBHOOK_URL'] || 'http://localhost:3000/webhook/asaas'
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: (globalThis as any)['NG_APP_PAYMENT_SUCCESS_URL'] || 'http://localhost:4200/payment-success',
    cancelUrl: (globalThis as any)['NG_APP_PAYMENT_CANCEL_URL'] || 'http://localhost:4200/booking'
  }
};
