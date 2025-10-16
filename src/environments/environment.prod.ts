export const environment = {
  production: true,
  
  // Configurações da API Backend
  apiUrl: 'https://your-production-api.com/api',
  
  // Configurações do ASAAS
  asaas: {
    apiKey: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjQ2N2Q5YjM5LTAwNTEtNDAwZi04NDdmLWFkZDIxMmRhYzM1MTo6JGFhY2hfZGMwYTE4NzktMTQwYy00ZDQzLWJmZWEtOTM4NDljNDRlNzZj', // 🔑 CHAVE DE PRODUÇÃO DO ASAAS
    environment: 'production',
    baseUrl: 'https://api-sandbox.asaas.com/',
    webhookUrl: 'https://your-production-domain.com/webhook/asaas'
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: 'https://your-production-domain.com/payment-success',
    cancelUrl: 'https://your-production-domain.com/booking',
    webhookSecret: 'your_production_webhook_secret'
  }
};
