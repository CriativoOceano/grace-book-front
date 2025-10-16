export const environment = {
  production: false,
  
  // Configurações da API Backend
  apiUrl: 'http://localhost:3000',
  
  // Configurações do ASAAS (para referência - será usado pelo backend)
  asaas: {
    apiKey: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjQ2N2Q5YjM5LTAwNTEtNDAwZi04NDdmLWFkZDIxMmRhYzM1MTo6JGFhY2hfZGMwYTE4NzktMTQwYy00ZDQzLWJmZWEtOTM4NDljNDRlNzZj',
    environment: 'sandbox',
    baseUrl: 'https://api-sandbox.asaas.com/',
    webhookUrl: 'http://localhost:3000/webhook/asaas' // Webhook no backend
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: 'http://localhost:4200/payment-success',
    cancelUrl: 'http://localhost:4200/booking'
  }
};
