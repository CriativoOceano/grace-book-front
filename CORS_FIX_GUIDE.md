# 🚀 Guia Rápido - Configuração CORS no Backend

## ⚠️ **Problema Atual**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/bookings' from origin 'http://localhost:4200' has been blocked by CORS policy
```

## ✅ **Solução: Configurar CORS no Backend NestJS**

### **1. Instalar CORS (se não estiver instalado)**
```bash
cd grace-book-back
npm install @nestjs/cors
```

### **2. Configurar CORS no main.ts**
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
  });
  
  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
}
bootstrap();
```

### **3. Ou usar decorator no controller**
```typescript
// src/modules/reservas/controllers/reservas.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ReservasService } from '../services/reservas.service';

@Controller('api/bookings')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  async createBooking(@Body() bookingData: any) {
    try {
      console.log('🚀 Recebendo dados do frontend:', bookingData);
      
      const result = await this.reservasService.createCompleteBooking(bookingData);
      
      console.log('✅ Reserva criada com sucesso:', result);
      
      return {
        success: true,
        message: 'Reserva criada com sucesso',
        data: result
      };
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      
      return {
        success: false,
        message: 'Erro ao processar pagamento',
        error: error.message
      };
    }
  }
}
```

## 🧪 **Como Testar**

### **1. Iniciar Backend**
```bash
cd grace-book-back
npm run start:dev
```

### **2. Verificar se está rodando**
```bash
curl http://localhost:3000/api/bookings
# Deve retornar erro 404 (não 500), confirmando que o servidor está rodando
```

### **3. Testar Frontend**
```bash
cd grace-book-front
ng serve
```

### **4. Testar Fluxo Completo**
1. Acesse `http://localhost:4200/booking`
2. Preencha os dados
3. Clique em "Finalizar Reserva"
4. Verifique os logs no backend

## 📋 **Logs Esperados**

### **Backend (Terminal)**
```
🚀 Recebendo dados do frontend: { tipo: "Diária Completa", ... }
👤 Criando cliente no ASAAS: { name: "João Silva", ... }
✅ Cliente criado no ASAAS: { id: "cus_123", ... }
💰 Criando pagamento no ASAAS: { customer: "cus_123", ... }
✅ Pagamento criado no ASAAS: { id: "pay_123", paymentLink: "..." }
✅ Reserva criada com sucesso: { bookingId: "123", checkoutUrl: "..." }
```

### **Frontend (Console)**
```
🚀 BookingComponent: Enviando dados para o backend
📋 Dados da reserva: { tipo: "Diária Completa", ... }
✅ Resposta do backend: { success: true, data: { checkoutUrl: "..." } }
🔗 Redirecionando para checkout: { data: { checkoutUrl: "..." } }
✅ Abrindo URL do checkout: https://sandbox.asaas.com/c/abc123
```

## 🔄 **Alternativa Temporária**

Enquanto você implementa o backend, o frontend está configurado com **MOCK** que simula a resposta do backend. Você pode testar o fluxo completo sem precisar do backend rodando.

### **Para usar o mock:**
- O frontend já está configurado com mock
- Simula delay de 2 segundos
- Retorna dados realistas
- Permite testar todo o fluxo

### **Para usar o backend real:**
1. Implemente o backend usando o `BACKEND_INTEGRATION_GUIDE.md`
2. Configure CORS conforme este guia
3. Descomente o código real no `BookingService`
4. Comente o código mock

## ⚡ **Comandos Rápidos**

```bash
# Backend
cd grace-book-back
npm run start:dev

# Frontend (em outro terminal)
cd grace-book-front
ng serve

# Testar se backend está rodando
curl http://localhost:3000/api/bookings
```

**Agora você pode testar o frontend com mock ou implementar o backend real!** 🚀
