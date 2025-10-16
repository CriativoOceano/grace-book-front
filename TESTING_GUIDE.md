# 🧪 Guia Completo de Testes - Grace Book Frontend

## 🚀 Como Testar Sua Aplicação

### 📋 **Pré-requisitos**
- ✅ Node.js instalado
- ✅ Angular CLI instalado
- ✅ Credenciais do ASAAS configuradas
- ✅ Aplicação compilando sem erros

---

## 🔧 **1. Iniciar a Aplicação**

### **Comando para Rodar**
```bash
# No terminal, na pasta do projeto
cd grace-book-front
ng serve
```

### **Verificar se Funcionou**
- ✅ Aplicação deve abrir em: `http://localhost:4200`
- ✅ Console deve mostrar: `✅ API Key do ASAAS configurada (Sandbox)`
- ❌ Não deve aparecer erros de compilação

---

## 🏠 **2. Testar Página Inicial**

### **O que Testar**
1. **Acesse**: `http://localhost:4200`
2. **Verifique**:
   - ✅ Página carrega sem erros
   - ✅ Layout responsivo funciona
   - ✅ Botões e links funcionam
   - ✅ Navegação entre páginas funciona

### **Testes de Navegação**
- [ ] Clique em "Fazer Reserva" → Deve ir para `/booking`
- [ ] Clique em "Minhas Reservas" → Deve ir para `/my-bookings`
- [ ] Clique em "Login" → Deve ir para `/login`

---

## 📝 **3. Testar Fluxo de Reserva Completo**

### **Passo 1: Informações da Reserva**
1. **Acesse**: `http://localhost:4200/booking`
2. **Preencha**:
   - ✅ Tipo de Reserva: "Diária Completa"
   - ✅ Período: Selecione datas futuras
   - ✅ Quantidade de Pessoas: 10
   - ✅ Quantidade de Chalés: 2
3. **Clique**: "Continuar"

### **Passo 2: Informações do Hóspede**
1. **Preencha**:
   - ✅ Nome: "João"
   - ✅ Sobrenome: "Silva"
   - ✅ Email: "joao@teste.com"
   - ✅ Telefone: "(11) 99999-9999"
2. **Clique**: "Verificar Disponibilidade"

### **Passo 3: Verificação de Disponibilidade**
1. **Verifique**:
   - ✅ Aparece mensagem "Período Disponível!"
   - ✅ Valor é calculado corretamente
   - ✅ Resumo da reserva está correto
2. **Clique**: "Continuar"

### **Passo 4: Pagamento**
1. **Selecione**: Modo de pagamento (PIX, Cartão ou Boleto)
2. **Verifique**: Resumo da reserva está correto
3. **Clique**: "Finalizar Reserva"

---

## 🔍 **4. Testes de Validação**

### **Teste de Campos Obrigatórios**
1. **Deixe campos vazios** e tente continuar
2. **Verifique**:
   - ✅ Aparecem mensagens de erro
   - ✅ Campos ficam com borda vermelha
   - ✅ Não permite continuar sem preencher

### **Teste de Formato de Email**
1. **Digite email inválido**: "email-invalido"
2. **Verifique**: Aparece erro de formato

### **Teste de Telefone**
1. **Digite**: "11999999999"
2. **Verifique**: Formata automaticamente para "(11) 99999-9999"

---

## 💳 **5. Teste de Integração com ASAAS**

### **Verificar Console do Navegador**
1. **Abra DevTools** (F12)
2. **Vá para aba Console**
3. **Procure por**:
   - ✅ `✅ API Key do ASAAS configurada (Sandbox)`
   - ✅ `Simulando criação de cliente:`
   - ✅ `Cliente salvo na base local:`

### **Teste de Criação de Pagamento**
1. **Complete o fluxo de reserva**
2. **Verifique no console**:
   - ✅ Requisições para ASAAS são feitas
   - ✅ Não há erros de autenticação
   - ✅ Resposta do ASAAS é recebida

---

## 🐛 **6. Testes de Erro**

### **Teste de Rede**
1. **Desconecte a internet**
2. **Tente fazer uma reserva**
3. **Verifique**: Aparece mensagem de erro apropriada

### **Teste de Dados Inválidos**
1. **Digite datas passadas**
2. **Verifique**: Não permite selecionar

---

## 📱 **7. Testes de Responsividade**

### **Desktop (1920x1080)**
- ✅ Layout funciona normalmente
- ✅ Todos os elementos são visíveis

### **Tablet (768x1024)**
- ✅ Layout se adapta
- ✅ Formulário ainda é usável

### **Mobile (375x667)**
- ✅ Layout responsivo funciona
- ✅ Campos são grandes o suficiente
- ✅ Botões são clicáveis

---

## 🔧 **8. Comandos de Desenvolvimento**

### **Compilar Aplicação**
```bash
ng build
```

### **Executar Testes**
```bash
ng test
```

### **Verificar Linting**
```bash
ng lint
```

### **Build de Produção**
```bash
ng build --prod
```

---

## 📊 **9. Checklist de Testes**

### **Funcionalidades Básicas**
- [ ] Aplicação inicia sem erros
- [ ] Página inicial carrega
- [ ] Navegação funciona
- [ ] Formulário de reserva funciona

### **Validações**
- [ ] Campos obrigatórios são validados
- [ ] Formato de email é validado
- [ ] Telefone é formatado automaticamente
- [ ] Datas passadas são bloqueadas

### **Integração ASAAS**
- [ ] API Key é carregada corretamente
- [ ] Cliente é criado no ASAAS
- [ ] Pagamento é processado
- [ ] Redirecionamento funciona

### **Responsividade**
- [ ] Desktop funciona
- [ ] Tablet funciona
- [ ] Mobile funciona

---

## 🚨 **Problemas Comuns e Soluções**

### **Erro: "API Key não configurada"**
**Solução**: Verifique se a chave está no `asaas.service.ts`

### **Erro: "Cannot find module"**
**Solução**: Execute `npm install`

### **Erro: "Port 4200 already in use"**
**Solução**: Execute `ng serve --port 4201`

### **Erro: "Unauthorized" do ASAAS**
**Solução**: Verifique se a chave está correta e ativa

---

## 🎯 **Resultado Esperado**

### **✅ Sucesso Total**
- Aplicação roda sem erros
- Fluxo de reserva funciona completamente
- Integração com ASAAS funciona
- Pagamentos são processados
- Usuário é redirecionado para checkout

### **📈 Métricas de Sucesso**
- ✅ 0 erros de compilação
- ✅ 0 erros no console
- ✅ 100% dos campos validados
- ✅ 100% dos fluxos funcionando

---

## 🚀 **Próximos Passos Após Testes**

1. **Implementar Backend**: Criar API para clientes
2. **Configurar Webhook**: Receber notificações do ASAAS
3. **Deploy**: Colocar em produção
4. **Monitoramento**: Acompanhar logs e erros

**Boa sorte com os testes!** 🎉
