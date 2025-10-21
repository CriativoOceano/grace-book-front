import { firebaseConfigProd } from './firebase.config';

export const environment = {
  production: true,
  
  // Configurações da API Backend
  apiUrl: process.env['NG_APP_API_URL'] || 'https://your-production-api.com/api',
  
  // Configurações do Firebase
  firebase: {
    apiKey: process.env['NG_APP_FIREBASE_API_KEY'],
    authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'],
    projectId: process.env['NG_APP_FIREBASE_PROJECT_ID'],
    storageBucket: process.env['NG_APP_FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['NG_APP_FIREBASE_APP_ID'],
    measurementId: process.env['NG_APP_FIREBASE_MEASUREMENT_ID']
  },
  
  // Configurações do ASAAS
  asaas: {
    apiKey: process.env['NG_APP_ASAAS_API_KEY'],
    environment: process.env['NG_APP_ASAAS_ENVIRONMENT'] || 'production',
    baseUrl: process.env['NG_APP_ASAAS_BASE_URL'] || 'https://api.asaas.com/',
    webhookUrl: process.env['NG_APP_ASAAS_WEBHOOK_URL']
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: process.env['NG_APP_PAYMENT_SUCCESS_URL'] || 'https://your-production-domain.com/payment-success',
    cancelUrl: process.env['NG_APP_PAYMENT_CANCEL_URL'] || 'https://your-production-domain.com/booking',
    webhookSecret: process.env['NG_APP_PAYMENT_WEBHOOK_SECRET'] || 'your_production_webhook_secret'
  }
};
