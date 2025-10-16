# 🚀 Guia de Implementação do Backend - Integração ASAAS

## 📋 Visão Geral

O frontend foi configurado para enviar dados para o seu backend NestJS. O backend deve processar a criação de clientes e pagamentos no ASAAS, retornando a URL do checkout para o frontend.

## 🔧 Estrutura da API

### **Endpoint Principal**
```
POST /api/bookings
```

### **Payload de Entrada**
```json
{
  "tipo": "Diária Completa",
  "periodoReserva": "2024-01-15",
  "quantidadePessoas": 2,
  "quantidadeChales": 1,
  "observacoes": "Observações da reserva",
  
  "nomeHospede": "João",
  "sobrenomeHospede": "Silva",
  "emailHospede": "joao@email.com",
  "telefoneHospede": "11999999999",
  "observacoesHospede": "Observações do hóspede",
  
  "modoPagamento": "PIX",
  "parcelas": 1,
  
  "successUrl": "http://localhost:4200/payment-success",
  "cancelUrl": "http://localhost:4200/booking"
}
```

### **Resposta de Sucesso**
```json
{
  "success": true,
  "message": "Reserva criada com sucesso",
  "data": {
    "bookingId": "booking_123",
    "customerId": "cus_asaas_123",
    "paymentId": "pay_asaas_123",
    "checkoutUrl": "https://sandbox.asaas.com/c/abc123",
    "qrCode": "00020126580014br.gov.bcb.pix...",
    "pixCode": "00020126580014br.gov.bcb.pix..."
  }
}
```

### **Resposta de Erro**
```json
{
  "success": false,
  "message": "Erro ao processar pagamento",
  "error": "Detalhes do erro"
}
```

## 🛠️ Implementação no Backend NestJS

### **1. Controller de Reservas**

```typescript
// src/modules/reservas/controllers/reservas.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ReservasService } from '../services/reservas.service';

export interface BookingRequest {
  tipo: string;
  periodoReserva: string;
  quantidadePessoas: number;
  quantidadeChales: number;
  observacoes?: string;
  
  nomeHospede: string;
  sobrenomeHospede: string;
  emailHospede: string;
  telefoneHospede: string;
  observacoesHospede?: string;
  
  modoPagamento: string;
  parcelas?: number;
  
  successUrl: string;
  cancelUrl: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  data?: {
    bookingId: string;
    customerId: string;
    paymentId: string;
    checkoutUrl: string;
    qrCode?: string;
    pixCode?: string;
  };
  error?: string;
}

@Controller('api/bookings')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  async createBooking(@Body() bookingData: BookingRequest): Promise<BookingResponse> {
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

### **2. Service de Reservas**

```typescript
// src/modules/reservas/services/reservas.service.ts
import { Injectable } from '@nestjs/common';
import { AsaasService } from '../../asaas/asaas.service';
import { ReservasRepository } from '../repositories/reservas.repository';

@Injectable()
export class ReservasService {
  constructor(
    private readonly asaasService: AsaasService,
    private readonly reservasRepository: ReservasRepository
  ) {}

  async createCompleteBooking(bookingData: any) {
    try {
      // 1. Salvar reserva no banco local
      const reserva = await this.reservasRepository.create({
        tipo: bookingData.tipo,
        periodoReserva: bookingData.periodoReserva,
        quantidadePessoas: bookingData.quantidadePessoas,
        quantidadeChales: bookingData.quantidadeChales,
        observacoes: bookingData.observacoes,
        status: 'PENDENTE'
      });

      // 2. Criar cliente no ASAAS
      const customerData = {
        name: `${bookingData.nomeHospede} ${bookingData.sobrenomeHospede}`,
        email: bookingData.emailHospede,
        phone: bookingData.telefoneHospede,
        mobilePhone: bookingData.telefoneHospede,
        externalReference: `GRACE_${reserva.id}`,
        personType: 'FISICA'
      };

      console.log('👤 Criando cliente no ASAAS:', customerData);
      const asaasCustomer = await this.asaasService.createCustomer(customerData);

      // 3. Criar pagamento no ASAAS
      const paymentData = {
        customer: asaasCustomer.id,
        billingType: bookingData.modoPagamento === 'PIX' ? 'PIX' : 'CREDIT_CARD',
        value: this.calculateBookingValue(bookingData),
        dueDate: this.getDueDate(),
        description: `Reserva Grace Book - ${bookingData.tipo}`,
        externalReference: `GRACE_PAY_${reserva.id}`,
        successUrl: bookingData.successUrl,
        cancelUrl: bookingData.cancelUrl
      };

      console.log('💰 Criando pagamento no ASAAS:', paymentData);
      const asaasPayment = await this.asaasService.createPayment(paymentData);

      // 4. Atualizar reserva com IDs do ASAAS
      await this.reservasRepository.update(reserva.id, {
        asaasCustomerId: asaasCustomer.id,
        asaasPaymentId: asaasPayment.id,
        checkoutUrl: asaasPayment.paymentLink,
        qrCode: asaasPayment.pixQrCode,
        pixCode: asaasPayment.pixQrCode
      });

      return {
        bookingId: reserva.id,
        customerId: asaasCustomer.id,
        paymentId: asaasPayment.id,
        checkoutUrl: asaasPayment.paymentLink,
        qrCode: asaasPayment.pixQrCode,
        pixCode: asaasPayment.pixQrCode
      };

    } catch (error) {
      console.error('❌ Erro no processo de reserva:', error);
      throw new Error(`Erro ao criar reserva: ${error.message}`);
    }
  }

  private calculateBookingValue(bookingData: any): number {
    // Implementar lógica de cálculo de valor
    const baseValue = 1000; // Valor base
    const peopleMultiplier = bookingData.quantidadePessoas;
    const chaletMultiplier = bookingData.quantidadeChales;
    
    return baseValue * peopleMultiplier * chaletMultiplier;
  }

  private getDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }
}
```

### **3. Service ASAAS**

```typescript
// src/modules/asaas/asaas.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsaasService {
  private readonly baseUrl = 'https://sandbox.asaas.com/api/v3';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('ASAAS_API_KEY');
  }

  async createCustomer(customerData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/customers`, customerData, {
          headers: {
            'access_token': this.apiKey,
            'Content-Type': 'application/json'
          }
        })
      );

      console.log('✅ Cliente criado no ASAAS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar cliente no ASAAS:', error.response?.data);
      throw new Error(`Erro ao criar cliente: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }

  async createPayment(paymentData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/payments`, paymentData, {
          headers: {
            'access_token': this.apiKey,
            'Content-Type': 'application/json'
          }
        })
      );

      console.log('✅ Pagamento criado no ASAAS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar pagamento no ASAAS:', error.response?.data);
      throw new Error(`Erro ao criar pagamento: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }
}
```

### **4. Configuração do Ambiente**

```typescript
// src/config/configuration.ts
export default () => ({
  asaas: {
    apiKey: process.env.ASAAS_API_KEY || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjQ2N2Q5YjM5LTAwNTEtNDAwZi04NDdmLWFkZDIxMmRhYzM1MTo6JGFhY2hfZGMwYTE4NzktMTQwYy00ZDQzLWJmZWEtOTM4NDljNDRlNzZj',
    environment: process.env.ASAAS_ENVIRONMENT || 'sandbox',
    baseUrl: process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3'
  }
});
```

### **5. Variáveis de Ambiente (.env)**

```env
# ASAAS Configuration
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjQ2N2Q5YjM5LTAwNTEtNDAwZi04NDdmLWFkZDIxMmRhYzM1MTo6JGFhY2hfZGMwYTE4NzktMTQwYy00ZDQzLWJmZWEtOTM4NDljNDRlNzZj
ASAAS_ENVIRONMENT=sandbox
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3

# Database
DATABASE_URL=mongodb://localhost:27017/grace-book

# Server
PORT=3000
```

## 🔄 Fluxo Completo

### **1. Frontend → Backend**
- Frontend envia dados da reserva para `POST /api/bookings`
- Backend recebe e valida os dados

### **2. Backend → ASAAS**
- Backend cria cliente no ASAAS
- Backend cria pagamento no ASAAS
- ASAAS retorna URL do checkout

### **3. Backend → Frontend**
- Backend retorna URL do checkout
- Frontend redireciona para o ASAAS

### **4. ASAAS → Frontend**
- Cliente faz pagamento no ASAAS
- ASAAS redireciona para `successUrl` ou `cancelUrl`

## 🧪 Como Testar

### **1. Iniciar o Backend**
```bash
cd grace-book-back
npm run start:dev
```

### **2. Iniciar o Frontend**
```bash
cd grace-book-front
ng serve
```

### **3. Testar o Fluxo**
1. Acesse `http://localhost:4200/booking`
2. Preencha os dados da reserva
3. Preencha os dados do hóspede
4. Clique em "Finalizar Reserva"
5. Verifique os logs no backend
6. Será redirecionado para o ASAAS

## 📝 Logs Esperados

### **Backend**
```
🚀 Recebendo dados do frontend: { tipo: "Diária Completa", ... }
👤 Criando cliente no ASAAS: { name: "João Silva", ... }
✅ Cliente criado no ASAAS: { id: "cus_123", ... }
💰 Criando pagamento no ASAAS: { customer: "cus_123", ... }
✅ Pagamento criado no ASAAS: { id: "pay_123", paymentLink: "..." }
✅ Reserva criada com sucesso: { bookingId: "123", checkoutUrl: "..." }
```

### **Frontend**
```
🚀 BookingComponent: Enviando dados para o backend
📋 Dados da reserva: { tipo: "Diária Completa", ... }
✅ Resposta do backend: { success: true, data: { checkoutUrl: "..." } }
🔗 Redirecionando para checkout: { data: { checkoutUrl: "..." } }
✅ Abrindo URL do checkout: https://sandbox.asaas.com/c/abc123
```

## ⚠️ Pontos Importantes

1. **CORS**: Configure CORS no backend para aceitar requisições do frontend
2. **Validação**: Valide todos os dados antes de enviar para o ASAAS
3. **Tratamento de Erros**: Implemente tratamento robusto de erros
4. **Logs**: Mantenha logs detalhados para debug
5. **Segurança**: Nunca exponha a API key do ASAAS no frontend

## 🎯 Próximos Passos

1. Implementar o controller e service no backend
2. Configurar as variáveis de ambiente
3. Testar a integração completa
4. Implementar webhook para atualizar status dos pagamentos
5. Adicionar validações e tratamento de erros

**Agora você tem tudo configurado para testar a integração real com o ASAAS!** 🚀
