# Frontend - Banking App

Esta é a interface web da aplicação bancária, desenvolvida com **Angular (v17+)**. Ela permite que os usuários interajam com a API para gerenciar clientes e realizar transações.

## 🛠️ Tecnologias

- **Angular**: Framework SPA.
- **TypeScript**: Linguagem principal.
- **CSS**: Estilização customizada.
- **Standalone Components**: Utiliza a nova abordagem do Angular sem NgModules.

## 📱 Funcionalidades

A interface possui as seguintes telas e componentes:

- **Dashboard**: Visão geral dos clientes cadastrados.
- **Cadastro de Cliente**: Modal para criar novos clientes.
- **Operações**: Modais para realizar Depósitos, Saques e Transferências.
- **Extrato**: Visualização do histórico de transações de um cliente.

## 🚀 Configuração e Execução

### Executando via Docker (Recomendado)
O frontend é servido automaticamente junto com o backend ao rodar `docker-compose up` na raiz do projeto. Acesse em [http://localhost:4200](http://localhost:4200).

### Executando Localmente

1.  Instale as dependências:
    ```bash
    npm install
    ```

2.  Inicie o servidor de desenvolvimento:
    ```bash
    ng serve
    ```

3.  Acesse a aplicação em `http://localhost:4200`.

## 📂 Estrutura do Projeto

```
src/app/
├── components/         # Componentes visuais (Modais, Dashboard, etc.)
├── services/           # Serviços de comunicação com a API (ApiService)
├── app.component.ts    # Componente raiz
├── app.config.ts       # Configuração da aplicação (Providers)
└── app.routes.ts       # Definição de rotas
```

## 🔗 Integração com Backend

O frontend espera que a API esteja rodando em `http://localhost:3000`. Caso a porta da API mude, atualize a URL base no serviço `api.service.ts` ou nos arquivos de `environment`.
