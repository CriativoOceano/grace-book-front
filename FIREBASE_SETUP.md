# Sistema de Gerenciamento de Imagens e Textos

## Configuração do Firebase

Para usar o sistema de gerenciamento de imagens, você precisa configurar o Firebase Storage:

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar o projeto

### 2. Configurar Firebase Storage

1. No console do Firebase, vá para "Storage"
2. Clique em "Começar"
3. Escolha "Modo de produção" ou "Modo de teste" (recomendado para desenvolvimento)
4. Escolha uma localização para seus dados

### 3. Obter Credenciais

1. Vá para "Configurações do projeto" (ícone de engrenagem)
2. Na aba "Geral", role até "Seus aplicativos"
3. Clique em "Adicionar aplicativo" e escolha "Web"
4. Registre o aplicativo com um nome (ex: "grace-book-front")
5. Copie as credenciais do Firebase

### 4. Configurar no Projeto

1. Abra o arquivo `grace-book-front/src/environments/firebase.config.ts`
2. Substitua os valores placeholder pelas suas credenciais:

```typescript
export const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 5. Configurar Regras de Storage

No Firebase Console, vá para "Storage" > "Regras" e configure:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir leitura pública
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Permitir upload apenas para usuários autenticados (opcional)
    match /{allPaths=**} {
      allow write: if true; // Para desenvolvimento
      // allow write: if request.auth != null; // Para produção
    }
  }
}
```

## Executando o Sistema

### Backend

1. Instale as dependências:
```bash
cd grace-book-back
npm install
```

2. Execute o seed para popular dados iniciais:
```bash
npm run seed:conteudo
```

3. Inicie o servidor:
```bash
npm run start:dev
```

### Frontend

1. Instale as dependências:
```bash
cd grace-book-front
npm install --legacy-peer-deps
```

2. Inicie o servidor:
```bash
npm run start:proxy
```

## Funcionalidades Implementadas

### ✅ Sistema Completo

- **Backend**: Schema estendido, DTOs, endpoints e repository
- **Frontend**: Serviços Firebase e Conteudo, componentes admin
- **Interface**: Botão discreto de acesso admin no rodapé
- **Componentes**: Todos os componentes do site atualizados para usar dados dinâmicos
- **Seed**: Script para popular dados iniciais

### 🔧 Como Usar

1. **Acessar Admin**: 
   - Faça login como administrador
   - Clique no link "Admin" discreto no rodapé da página

2. **Gerenciar Conteúdo**:
   - Vá para a aba "Conteúdo do Site"
   - Use os painéis expansíveis para gerenciar cada seção
   - As funcionalidades de upload serão implementadas nos próximos passos

### 📁 Estrutura de Arquivos

```
Frontend:
├── environments/firebase.config.ts (configuração Firebase)
├── core/services/
│   ├── firebase-storage.service.ts (upload de imagens)
│   └── conteudo.service.ts (comunicação com backend)
└── pages/admin/components/
    └── content-manager/ (interface de administração)

Backend:
├── schemas/config.schema.ts (schema estendido)
├── modules/configuracoes/
│   ├── DTO/update-conteudo-site.dto.ts
│   ├── controllers/configuracoes.controller.ts
│   └── repositories/configuracoes.repository.ts
└── scripts/seed-conteudo.ts (dados iniciais)
```

## Próximos Passos

Para completar o sistema, ainda é necessário implementar:

1. **Upload de Imagens**: Integrar Firebase Storage com os componentes de edição
2. **Editor de Slides**: Formulários para editar slides do carousel
3. **Editor de Imagens**: Formulários para editar imagens da galeria
4. **Drag & Drop**: Reordenação de slides e imagens
5. **Validações**: Validação de tipos de arquivo e tamanhos

## Observações Importantes

- Firebase Storage é gratuito até 5GB de armazenamento
- O sistema usa dados de fallback caso a API não esteja disponível
- Todas as imagens atuais (Unsplash) são mantidas como dados padrão
- O botão de admin só aparece para usuários com `isAdmin: true`
