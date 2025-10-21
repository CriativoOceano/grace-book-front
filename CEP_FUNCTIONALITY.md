# Funcionalidade de Busca de CEP

## Visão Geral
Implementada busca automática de endereço por CEP usando a API ViaCEP, integrada ao formulário de reserva.

## Funcionalidades

### 🔍 Busca Automática
- **API**: ViaCEP (https://viacep.com.br/)
- **Gratuita**: Sem necessidade de chave de API
- **Confiável**: Dados oficiais dos Correios
- **Automática**: Busca ao digitar, sem necessidade de botão

### 📝 Campos Preenchidos Automaticamente
- **Endereço**: Logradouro (rua, avenida, etc.)
- **Bairro**: Nome do bairro
- **Cidade**: Nome da cidade
- **UF**: Estado (sigla de 2 letras)
- **CEP**: Formatado automaticamente (00000-000)

### 🎯 Interface do Usuário
- **Campo CEP**: Primeiro campo do grupo de endereço
- **Busca automática**: Ao digitar 8 dígitos
- **Debounce**: Aguarda 500ms após parar de digitar
- **Loading**: Indicador visual durante a busca
- **Feedback**: Indicador quando endereço é encontrado
- **Campos bloqueados**: Campos preenchidos automaticamente ficam desabilitados
- **Edição manual**: Botão "Editar manualmente" para reabilitar campos

## Como Usar

### 1. Digite o CEP
```
Exemplo: 01310-100 ou 01310100
```

### 2. Busca Automática
- Sistema aguarda 500ms após parar de digitar
- Busca automaticamente quando CEP tem 8 dígitos
- Mostra indicador "Buscando endereço..."
- Preenche campos automaticamente

### 3. Resultado
- **Sucesso**: Campos preenchidos automaticamente
- **Indicador**: "Endereço encontrado automaticamente"
- **Campos readonly**: Endereço, Bairro, Cidade e UF ficam readonly
- **Campo livre**: Número permanece editável
- **Edição manual**: Botão "Editar manualmente" para limpar todos os campos

### 4. Edição Manual
- **Botão**: "Editar manualmente" aparece quando CEP é encontrado
- **Ação**: Limpa todos os campos e remove readonly
- **Flexibilidade**: Permite correção manual se necessário

## Validações

### ✅ CEP Válido
- Deve ter exatamente 8 dígitos
- Aceita formatos: `00000-000` ou `00000000`
- Remove automaticamente caracteres não numéricos

### ❌ CEP Inválido
- Menos de 8 dígitos: "CEP deve ter 8 dígitos"
- CEP não encontrado: "CEP não encontrado"
- Erro de rede: "Erro ao buscar CEP. Verifique se o CEP está correto."

## Exemplos de CEPs para Teste

### São Paulo - SP
- **01310-100**: Av. Paulista, Bela Vista
- **04038-001**: Av. Paulista, Vila Olímpia
- **05407-002**: Rua Augusta, Consolação

### Rio de Janeiro - RJ
- **20040-020**: Rua Primeiro de Março, Centro
- **22071-900**: Av. Atlântica, Copacabana

### Brasília - DF
- **70040-010**: Esplanada dos Ministérios, Zona Cívico-Administrativa
- **70390-100**: Setor Comercial Sul

## Implementação Técnica

### Serviço (CepService)
```typescript
// Buscar CEP
buscarCep(cep: string): Observable<EnderecoCompleto>

// Formatar CEP
formatarCep(cep: string): string

// Validar CEP
validarCep(cep: string): boolean
```

### Componente (BookingComponent)
```typescript
// Buscar endereço
buscarEnderecoPorCep(): void

// Limpar endereço
limparEndereco(): void

// Estados
buscandoCep: boolean
cepEncontrado: boolean
```

### Interface de Dados
```typescript
interface EnderecoCompleto {
  cep: string;
  endereco: string;
  numero?: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}
```

## Benefícios

### 👤 Para o Usuário
- **Rapidez**: Preenchimento automático
- **Precisão**: Dados oficiais dos Correios
- **Facilidade**: Menos digitação manual
- **Confiabilidade**: Validação automática

### 🏢 Para o Negócio
- **Qualidade**: Dados de endereço mais precisos
- **Conversão**: Menos abandono no formulário
- **UX**: Experiência mais fluida
- **Dados**: Informações completas para entrega

## Troubleshooting

### Problema: CEP não encontrado
**Solução**: Verificar se o CEP está correto e existe

### Problema: Erro de rede
**Solução**: Verificar conexão com internet

### Problema: Campos não preenchem
**Solução**: Verificar se o CEP tem 8 dígitos

### Problema: API indisponível
**Solução**: ViaCEP é muito confiável, raramente fica fora do ar
