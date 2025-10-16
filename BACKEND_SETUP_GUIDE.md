# 🚀 Configuração Backend - Resolver CORS

## ⚠️ **Problema Atual**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/bookings' from origin 'http://localhost:4200' has been blocked by CORS policy
```

## ✅ **Solução Implementada**

### **1. Frontend Configurado**
- ✅ **Proxy Angular** configurado (`proxy.conf.json`)
- ✅ **Environment** atualizado para usar `/api`
- ✅ **Comando** `npm run start:proxy` adicionado
- ✅ **Mock removido** - usando backend real

### **2. Como Usar**

#### **Iniciar Frontend com Proxy**
```bash
cd grace-book-front
npm run start:proxy
```

#### **Iniciar Backend**
```bash
cd grace-book-back
npm run start:dev
```

## 🔧 **Configuração do Backend NestJS**

### **1. Instalar CORS**
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

### **3. Criar Controller de Reservas**
```typescript
// src/modules/reservas/controllers/reservas.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ReservasService } from '../services/reservas.service';

@Controller('api/bookings')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  async createBooking(@Body() bookingData: any) {
    try {
      console.log('🚀 Recebendo dados do frontend:', bookingData);
      
      // Simular resposta por enquanto
      const result = {
        bookingId: `booking_${Date.now()}`,
        customerId: `cus_${Date.now()}`,
        paymentId: `pay_${Date.now()}`,
        checkoutUrl: `https://sandbox.asaas.com/c/test_${Date.now()}`,
        qrCode: `00020126580014br.gov.bcb.pix0136test${Date.now()}520400005303986540510.005802BR5913ASAAS PAGAMENTO6009SAO PAULO62070503***6304TEST`,
        pixCode: `00020126580014br.gov.bcb.pix0136test${Date.now()}520400005303986540510.005802BR5913ASAAS PAGAMENTO6009SAO PAULO62070503***6304TEST`
      };
      
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

### **4. Registrar no AppModule**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ReservasController } from './modules/reservas/controllers/reservas.controller';

@Module({
  imports: [],
  controllers: [ReservasController],
  providers: [],
})
export class AppModule {}
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

### **3. Iniciar Frontend com Proxy**
```bash
cd grace-book-front
npm run start:proxy
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
✅ Reserva criada com sucesso: { bookingId: "booking_123", checkoutUrl: "..." }
```

### **Frontend (Console)**
```
🚀 Enviando dados para o backend: { tipo: "Diária Completa", ... }
✅ Resposta do backend: { success: true, data: { checkoutUrl: "..." } }
🔗 Redirecionando para checkout: { data: { checkoutUrl: "..." } }
✅ Abrindo URL do checkout: https://sandbox.asaas.com/c/abc123
```

## ⚡ **Comandos Rápidos**

```bash
# Backend
cd grace-book-back
npm run start:dev

# Frontend (em outro terminal)
cd grace-book-front
npm run start:proxy

# Testar se backend está rodando
curl http://localhost:3000/api/bookings
```

## 🔄 **Fluxo de Comunicação**

1. **Frontend** → `http://localhost:4200/api/bookings`
2. **Proxy Angular** → Redireciona para `http://localhost:3000/api/bookings`
3. **Backend** → Processa e retorna resposta
4. **Frontend** → Recebe resposta e redireciona para ASAAS

**Agora o frontend se comunica diretamente com o backend sem problemas de CORS!** 🚀
