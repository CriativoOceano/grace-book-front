# 🔑 Configuração das Credenciais do ASAAS

## 📁 Onde Configurar

### 1. **Arquivo de Desenvolvimento**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  
  // Configurações do ASAAS
  asaas: {
    apiKey: 'SUA_CHAVE_DO_ASAAS_AQUI', // 🔑 Substitua pela sua chave
    environment: 'sandbox', // 'sandbox' para testes
    baseUrl: 'https://www.asaas.com/api/v3',
    webhookUrl: 'http://localhost:4200/webhook/asaas'
  }
};
```

### 2. **Arquivo de Produção**
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  
  // Configurações do ASAAS
  asaas: {
    apiKey: 'SUA_CHAVE_DE_PRODUCAO_AQUI', // 🔑 Chave de produção
    environment: 'production', // 'production' para produção
    baseUrl: 'https://www.asaas.com/api/v3',
    webhookUrl: 'https://seu-dominio.com/webhook/asaas'
  }
};
```

## 🔐 Como Obter as Credenciais

### 1. **Acesse o Painel do ASAAS**
- Vá para: https://www.asaas.com/
- Faça login na sua conta
- Acesse: **Integrações > API**

### 2. **Obtenha sua API Key**
- Clique em **"Gerar Nova Chave"**
- Copie a chave gerada
- Cole no arquivo `environment.ts`

### 3. **Configure o Ambiente**
- **Sandbox**: Para testes (não cobra dinheiro real)
- **Production**: Para ambiente real (cobra dinheiro real)

## ⚠️ Importante

### **Segurança**
- ❌ **NUNCA** commite credenciais reais no Git
- ✅ Use variáveis de ambiente em produção
- ✅ Mantenha chaves de produção separadas

### **Ambientes**
- **Desenvolvimento**: Use sempre `sandbox`
- **Produção**: Use `production` apenas quando estiver pronto

## 🚀 Exemplo de Configuração Completa

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  
  // Configurações da API Backend
  apiUrl: 'http://localhost:3000/api',
  
  // Configurações do ASAAS
  asaas: {
    apiKey: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzI2NDM6OiRhYWNoXzE4YzEwZGM4LTQ5YjEtNDQ5OS04OTYwLWE0YjQ0YzQ4YzQ4Yw==', // Exemplo
    environment: 'sandbox',
    baseUrl: 'https://www.asaas.com/api/v3',
    webhookUrl: 'http://localhost:4200/webhook/asaas'
  },
  
  // Configurações de pagamento
  payment: {
    successUrl: 'http://localhost:4200/payment-success',
    cancelUrl: 'http://localhost:4200/booking',
    webhookSecret: 'seu_webhook_secret_aqui'
  }
};
```

## 🔧 Variáveis de Ambiente (Recomendado para Produção)

```bash
# .env (não commitar no Git)
ASAAS_API_KEY=sua_chave_aqui
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_URL=https://seu-dominio.com/webhook/asaas
```

## 📝 Checklist de Configuração

- [ ] Obteve API Key do ASAAS
- [ ] Configurou `environment.ts` com a chave
- [ ] Configurou `environment.prod.ts` para produção
- [ ] Testou em ambiente sandbox primeiro
- [ ] Configurou webhook URL
- [ ] Testou pagamentos em sandbox
- [ ] Migrou para produção quando pronto

## 🆘 Problemas Comuns

### **Erro: "API Key não configurada"**
- Verifique se a chave está no arquivo `environment.ts`
- Certifique-se de que não está usando `'your_asaas_api_key_here'`

### **Erro: "Unauthorized"**
- Verifique se a API Key está correta
- Confirme se está usando o ambiente correto (sandbox/production)

### **Erro: "Webhook não configurado"**
- Configure a URL do webhook no ASAAS
- Certifique-se de que a URL está acessível publicamente
