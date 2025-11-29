from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import sqlite3
from datetime import datetime
import hashlib
import secrets

app = FastAPI(title="AvaliaMAIS API")

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== MODELOS DE DADOS ==========

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class AvaliacaoCreate(BaseModel):
    id_midia: str
    tipo_midia: str  # 'movie', 'tv', 'book'
    nota_final: float
    critica: Optional[str] = None
    titulo_midia: str
    poster_path: Optional[str] = None

class FavoritoCreate(BaseModel):
    id_midia: str
    tipo_midia: str
    titulo_midia: str
    poster_path: Optional[str] = None

# ========== BANCO DE DADOS ==========

def get_db():
    conn = sqlite3.connect('avaliaMAIS.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Tabela Usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela Avaliações
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS avaliacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_midia TEXT NOT NULL,
            tipo_midia TEXT NOT NULL,
            titulo_midia TEXT NOT NULL,
            poster_path TEXT,
            nota_final REAL NOT NULL,
            critica TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
            UNIQUE(id_usuario, id_midia)
        )
    ''')
    
    # Tabela Favoritos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favoritos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_midia TEXT NOT NULL,
            tipo_midia TEXT NOT NULL,
            titulo_midia TEXT NOT NULL,
            poster_path TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
            UNIQUE(id_usuario, id_midia)
        )
    ''')
    
    conn.commit()
    conn.close()

# Inicializar banco ao startar
@app.on_event("startup")
def startup():
    init_db()

# ========== FUNÇÕES AUXILIARES ==========

def hash_senha(senha: str) -> str:
    return hashlib.sha256(senha.encode()).hexdigest()

def verificar_senha(senha: str, senha_hash: str) -> bool:
    return hash_senha(senha) == senha_hash

# ========== ROTAS DE AUTENTICAÇÃO ==========

@app.post("/api/auth/register")
def registrar(usuario: UsuarioCreate):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        senha_hash = hash_senha(usuario.senha)
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
            (usuario.nome, usuario.email, senha_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        return {
            "message": "Usuário registrado com sucesso",
            "user": {
                "id": user_id,
                "nome": usuario.nome,
                "email": usuario.email
            }
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    finally:
        conn.close()

@app.post("/api/auth/login")
def login(credentials: UsuarioLogin):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (credentials.email,))
    usuario = cursor.fetchone()
    conn.close()
    
    if not usuario or not verificar_senha(credentials.senha, usuario['senha_hash']):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    return {
        "message": "Login realizado com sucesso",
        "user": {
            "id": usuario['id'],
            "nome": usuario['nome'],
            "email": usuario['email']
        }
    }

# ========== ROTAS DE AVALIAÇÕES ==========

@app.post("/api/avaliacoes/{user_id}")
def criar_avaliacao(user_id: int, avaliacao: AvaliacaoCreate):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO avaliacoes (id_usuario, id_midia, tipo_midia, titulo_midia, poster_path, nota_final, critica)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, avaliacao.id_midia, avaliacao.tipo_midia, avaliacao.titulo_midia, 
              avaliacao.poster_path, avaliacao.nota_final, avaliacao.critica))
        conn.commit()
        return {"message": "Avaliação criada com sucesso", "id": cursor.lastrowid}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Você já avaliou este item")
    finally:
        conn.close()

@app.get("/api/avaliacoes/{user_id}")
def listar_avaliacoes(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM avaliacoes 
        WHERE id_usuario = ? 
        ORDER BY criado_em DESC
    ''', (user_id,))
    
    avaliacoes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"avaliacoes": avaliacoes}

@app.get("/api/avaliacoes/midia/{id_midia}")
def obter_avaliacao_midia(id_midia: str, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM avaliacoes 
        WHERE id_usuario = ? AND id_midia = ?
    ''', (user_id, id_midia))
    
    avaliacao = cursor.fetchone()
    conn.close()
    
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    return dict(avaliacao)

@app.delete("/api/avaliacoes/{avaliacao_id}")
def deletar_avaliacao(avaliacao_id: int, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM avaliacoes WHERE id = ? AND id_usuario = ?", (avaliacao_id, user_id))
    conn.commit()
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    conn.close()
    return {"message": "Avaliação deletada com sucesso"}

# ========== ROTAS DE FAVORITOS ==========

@app.post("/api/favoritos/{user_id}")
def adicionar_favorito(user_id: int, favorito: FavoritoCreate):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO favoritos (id_usuario, id_midia, tipo_midia, titulo_midia, poster_path)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, favorito.id_midia, favorito.tipo_midia, favorito.titulo_midia, favorito.poster_path))
        conn.commit()
        return {"message": "Favorito adicionado com sucesso", "id": cursor.lastrowid}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Item já está nos favoritos")
    finally:
        conn.close()

@app.get("/api/favoritos/{user_id}")
def listar_favoritos(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM favoritos 
        WHERE id_usuario = ? 
        ORDER BY criado_em DESC
    ''', (user_id,))
    
    favoritos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"favoritos": favoritos}

@app.delete("/api/favoritos/{favorito_id}")
def remover_favorito(favorito_id: int, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM favoritos WHERE id = ? AND id_usuario = ?", (favorito_id, user_id))
    conn.commit()
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorito não encontrado")
    
    conn.close()
    return {"message": "Favorito removido com sucesso"}

# ========== ROTAS DE RECOMENDAÇÃO ==========

@app.get("/api/recomendacoes/{user_id}")
def obter_recomendacoes(user_id: int):
    """
    Sistema básico de recomendação baseado em gêneros favoritos
    Retorna os IDs de mídias mais bem avaliadas pelo usuário
    """
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id_midia, tipo_midia, titulo_midia, poster_path, nota_final
        FROM avaliacoes 
        WHERE id_usuario = ? AND nota_final >= 8.0
        ORDER BY nota_final DESC
        LIMIT 10
    ''', (user_id,))
    
    recomendacoes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"recomendacoes": recomendacoes}

# ========== ROTA DE RANKING ==========

@app.get("/api/ranking")
def obter_ranking(tipo_midia: Optional[str] = None):
    """
    Retorna ranking de mídias mais bem avaliadas
    """
    conn = get_db()
    cursor = conn.cursor()
    
    query = '''
        SELECT id_midia, tipo_midia, titulo_midia, poster_path, 
               AVG(nota_final) as media_nota, COUNT(*) as total_avaliacoes
        FROM avaliacoes
    '''
    
    if tipo_midia:
        query += f" WHERE tipo_midia = '{tipo_midia}'"
    
    query += '''
        GROUP BY id_midia
        HAVING total_avaliacoes >= 1
        ORDER BY media_nota DESC, total_avaliacoes DESC
        LIMIT 50
    '''
    
    cursor.execute(query)
    ranking = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"ranking": ranking}

@app.get("/")
def root():
    return {
        "message": "AvaliaMAIS API está funcionando!",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/register, /api/auth/login",
            "avaliacoes": "/api/avaliacoes/{user_id}",
            "favoritos": "/api/favoritos/{user_id}",
            "recomendacoes": "/api/recomendacoes/{user_id}",
            "ranking": "/api/ranking"
        }
    }