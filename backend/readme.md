# Backend AvaliaMAIS - Guia de Instalação

## 📋 Pré-requisitos
- Python 3.8 ou superior instalado
- Terminal/CMD aberto na pasta do projeto

## 🚀 Instalação Rápida

### 1. Criar ambiente virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Rodar o servidor
```bash
uvicorn main:app --reload --port 8000
```

O servidor estará rodando em: **http://localhost:8000**

## 📚 Documentação da API

Acesse automaticamente em: **http://localhost:8000/docs**

## 🔌 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/register` - Cadastrar novo usuário
- `POST /api/auth/login` - Fazer login

### Avaliações
- `POST /api/avaliacoes/{user_id}` - Criar avaliação
- `GET /api/avaliacoes/{user_id}` - Listar avaliações do usuário
- `GET /api/avaliacoes/midia/{id_midia}?user_id=X` - Obter avaliação específica
- `DELETE /api/avaliacoes/{avaliacao_id}?user_id=X` - Deletar avaliação

### Favoritos
- `POST /api/favoritos/{user_id}` - Adicionar favorito
- `GET /api/favoritos/{user_id}` - Listar favoritos
- `DELETE /api/favoritos/{favorito_id}?user_id=X` - Remover favorito

### Recomendações e Ranking
- `GET /api/recomendacoes/{user_id}` - Obter recomendações personalizadas
- `GET /api/ranking` - Ranking geral
- `GET /api/ranking?tipo_midia=movie` - Ranking de filmes

## 🔄 Integração com Frontend

### Exemplo de uso no JavaScript:

```javascript
// Registrar usuário
const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nome: "João Silva",
        email: "joao@email.com",
        senha: "senha123"
    })
});

// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: "joao@email.com",
        senha: "senha123"
    })
});
const userData = await loginResponse.json();
const userId = userData.user.id;

// Criar avaliação
await fetch(`http://localhost:8000/api/avaliacoes/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        id_midia: "550",
        tipo_midia: "movie",
        titulo_midia: "Clube da Luta",
        poster_path: "/path.jpg",
        nota_final: 9.5,
        critica: "Filme incrível!"
    })
});

// Listar avaliações
const avaliacoes = await fetch(`http://localhost:8000/api/avaliacoes/${userId}`);
const data = await avaliacoes.json();
```

## 💾 Banco de Dados

O sistema usa SQLite (arquivo `avaliaMAIS.db` criado automaticamente).

### Estrutura das Tabelas:

**usuarios**
- id, nome, email, senha_hash, criado_em

**avaliacoes**
- id, id_usuario, id_midia, tipo_midia, titulo_midia, poster_path, nota_final, critica, criado_em

**favoritos**
- id, id_usuario, id_midia, tipo_midia, titulo_midia, poster_path, criado_em

## 🛠️ Próximos Passos

1. **Atualizar login.js** para usar a API:
```javascript
// Substituir localStorage por chamadas à API
const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
});
```

2. **Criar página de avaliação** que envia dados para:
```
POST /api/avaliacoes/{user_id}
```

3. **Adicionar sistema de favoritos** nos cards de mídia

4. **Criar página de perfil** mostrando avaliações do usuário

## ⚠️ Observações

- Em produção, use um banco PostgreSQL/MySQL
- Implemente JWT para autenticação mais segura
- Adicione validações de segurança
- Configure CORS adequadamente para seu domínio

## 🐛 Solução de Problemas

**Erro de porta ocupada:**
```bash
uvicorn main:app --reload --port 8001
```

**Erro de importação:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**Ver logs detalhados:**
```bash
uvicorn main:app --reload --log-level debug
```