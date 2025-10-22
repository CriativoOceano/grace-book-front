export const environment = {
  production: true,
  
  // Configurações da API Backend
  apiUrl: (globalThis as any)['NG_APP_API_URL'] || '',
  
  // Configurações do Firebase
  firebase: {
    apiKey: (globalThis as any)['NG_APP_FIREBASE_API_KEY'] || '',
    authDomain: (globalThis as any)['NG_APP_FIREBASE_AUTH_DOMAIN'] || '',
    projectId: (globalThis as any)['NG_APP_FIREBASE_PROJECT_ID'] || '',
    storageBucket: (globalThis as any)['NG_APP_FIREBASE_STORAGE_BUCKET'] || '',
    messagingSenderId: (globalThis as any)['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || '',
    appId: (globalThis as any)['NG_APP_FIREBASE_APP_ID'] || '',
    measurementId: (globalThis as any)['NG_APP_FIREBASE_MEASUREMENT_ID'] || ''
  },
  
  // Configurações do ASAAS
  asaas: {
    apiKey: (globalThis as any)['NG_APP_ASAAS_API_KEY'] || '',
    environment: (globalThis as any)['NG_APP_ASAAS_ENVIRONMENT'] || 'production',
    baseUrl: (globalThis as any)['NG_APP_ASAAS_BASE_URL'] || '',
    webhookUrl: (globalThis as any)['NG_APP_ASAAS_WEBHOOK_URL'] || ''
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: (globalThis as any)['NG_APP_PAYMENT_SUCCESS_URL'] || '',
    cancelUrl: (globalThis as any)['NG_APP_PAYMENT_CANCEL_URL'] || '',
    webhookSecret: (globalThis as any)['NG_APP_PAYMENT_WEBHOOK_SECRET'] || ''
  }
};
