"""
database.py — Gerenciamento do Banco de Dados SQLite (DV Odonto & Saúde Multiprofissional)
"""

import json
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash

DB_NAME = "dv_odonto.db"


def conectar():
    """Conecta ao banco de dados SQLite e retorna conexões orientadas a dicionário/Row."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def criar_tabelas():
    """Cria todas as tabelas necessárias no banco de dados caso não existam."""
    conn = conectar()
    c = conn.cursor()

    # 1. Tabela de Pacientes (Padrão e-SUS / Cartão SUS)
    c.execute("""
    CREATE TABLE IF NOT EXISTS pacientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT,
        cpf TEXT,
        cns TEXT,                  -- Cartão Nacional de Saúde (SUS)
        cnes_unidade TEXT,         -- Código da Unidade de Saúde (CNES)
        data_nascimento TEXT,
        sexo TEXT,
        bairro TEXT,
        peso REAL,
        altura REAL,
        pressao TEXT,
        imc REAL,
        classificacao_imc TEXT
    )
    """)

    # 2. Tabela de Odontograma (com suporte a Código SIGTAP)
    c.execute("""
    CREATE TABLE IF NOT EXISTS odontograma(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        dente TEXT,
        face TEXT,
        condicao TEXT,
        codigo_sigtap TEXT,         -- Código do procedimento no SUS
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
    """)

    # 3. Tabela de Arquivos/Anexos
    c.execute("""
    CREATE TABLE IF NOT EXISTS arquivos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        tipo TEXT,
        nome_original TEXT,
        nome_stored TEXT,
        mime_type TEXT,
        descricao TEXT,
        criado_em TEXT,
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
    """)

    # 4. Tabela da Agenda
    c.execute("""
    CREATE TABLE IF NOT EXISTS agenda(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        data_hora TEXT,
        especialidade TEXT,
        procedimento TEXT,
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
    """)

    # 5. Tabela de Evolução SOAP (e-SUS APS)
    c.execute("""
    CREATE TABLE IF NOT EXISTS prontuario_soap (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        data_atendimento DATETIME DEFAULT CURRENT_TIMESTAMP,
        subjetivo TEXT,
        objetivo TEXT,
        avaliacao TEXT,
        plano TEXT,
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
    """)

    # 6. Tabela de Usuários do Sistema (Controle de Acesso RBAC)
    c.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        usuario TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        perfil TEXT NOT NULL,      -- ADMIN, RECEPCAO, MEDICO, DENTISTA, ENFERMEIRO, PSICOLOGO
        registro_profissional TEXT  -- CRM, CRO, COREN, CRP, etc.
    )
    """)

    conn.commit()
    conn.close()


# ===================================================================
# GESTÃO DE USUÁRIOS E AUTENTICAÇÃO
# ===================================================================

def criar_usuario_admin_inicial():
    """Cria um usuário administrador padrão (admin / admin123) se a tabela estiver vazia."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    if cursor.fetchone()[0] == 0:
        senha_hash = generate_password_hash("admin123")
        cursor.execute("""
            INSERT INTO usuarios (nome, usuario, senha_hash, perfil, registro_profissional)
            VALUES (?, ?, ?, ?, ?)
        """, ("Administrador Geral", "admin", senha_hash, "ADMIN", "MASTER"))
        conn.commit()
    conn.close()


def buscar_usuario_por_login(usuario):
    """Busca os dados de um usuário pelo seu login."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE usuario = ?", (usuario,))
    dado = cursor.fetchone()
    conn.close()
    return dict(dado) if dado else None


def cadastrar_usuario(nome, usuario, senha, perfil, registro_profissional=""):
    """Cadastra um novo profissional/usuário no sistema."""
    senha_hash = generate_password_hash(senha)
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO usuarios (nome, usuario, senha_hash, perfil, registro_profissional)
            VALUES (?, ?, ?, ?, ?)
        """, (nome, usuario, senha_hash, perfil, registro_profissional))
        conn.commit()
        sucesso = True
    except sqlite3.IntegrityError:
        sucesso = False  # Usuário já existente
    conn.close()
    return sucesso


def listar_usuarios():
    """Retorna a lista de todos os usuários cadastrados."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome, usuario, perfil, registro_profissional FROM usuarios ORDER BY nome")
    dados = cursor.fetchall()
    conn.close()
    return [dict(x) for x in dados]


# ===================================================================
# FUNÇÕES DE CÁLCULO E AUXILIARES
# ===================================================================

def calcular_imc(peso, altura):
    """Calcula o IMC e retorna o valor numérico e a classificação."""
    try:
        if not peso or not altura:
            return None, ""

        p = float(peso)
        a = float(altura)

        if a > 3.0:
            a = a / 100.0

        if a <= 0 or p <= 0:
            return None, ""

        imc = p / (a**2)

        if imc < 18.5:
            classe = "Abaixo do peso"
        elif imc < 25:
            classe = "Peso normal"
        elif imc < 30:
            classe = "Sobrepeso"
        elif imc < 35:
            classe = "Obesidade Grau I"
        elif imc < 40:
            classe = "Obesidade Grau II"
        else:
            classe = "Obesidade Grau III"

        return round(imc, 2), classe

    except (ValueError, TypeError, ZeroDivisionError):
        return None, ""


# ===================================================================
# OPERAÇÕES DE PACIENTES
# ===================================================================

def adicionar_paciente(
    nome,
    telefone="",
    cpf="",
    cns="",
    cnes_unidade="",
    data_nascimento="",
    sexo="",
    bairro="",
    peso=0,
    altura=0,
    pressao="",
):
    imc, classe = calcular_imc(peso, altura)

    conn = conectar()
    conn.execute(
        """
    INSERT INTO pacientes
    (nome, telefone, cpf, cns, cnes_unidade, data_nascimento, sexo, bairro, peso, altura, pressao, imc, classificacao_imc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            nome,
            telefone,
            cpf,
            cns,
            cnes_unidade,
            data_nascimento,
            sexo,
            bairro,
            peso,
            altura,
            pressao,
            imc,
            classe,
        ),
    )
    conn.commit()
    conn.close()


def list_pacientes():
    conn = conectar()
    dados = conn.execute("SELECT * FROM pacientes ORDER BY nome").fetchall()
    conn.close()
    return [dict(x) for x in dados]


def get_paciente(id_paciente):
    conn = conectar()
    dado = conn.execute("SELECT * FROM pacientes WHERE id=?", (id_paciente,)).fetchone()
    conn.close()
    return dict(dado) if dado else None


def atualizar_paciente(id_paciente, dados):
    peso = dados.get("peso", 0)
    altura = dados.get("altura", 0)
    imc, classe = calcular_imc(peso, altura)

    conn = conectar()
    conn.execute(
        """
    UPDATE pacientes
    SET
        nome=?,
        telefone=?,
        cpf=?,
        cns=?,
        cnes_unidade=?,
        data_nascimento=?,
        sexo=?,
        bairro=?,
        pressao=?,
        peso=?,
        altura=?,
        imc=?,
        classificacao_imc=?
    WHERE id=?
    """,
        (
            dados.get("nome"),
            dados.get("telefone"),
            dados.get("cpf"),
            dados.get("cns"),
            dados.get("cnes_unidade"),
            dados.get("data_nascimento"),
            dados.get("sexo"),
            dados.get("bairro"),
            dados.get("pressao"),
            peso,
            altura,
            imc,
            classe,
            id_paciente,
        ),
    )
    conn.commit()
    conn.close()


# ===================================================================
# OPERAÇÕES DE ARQUIVOS / ANEXOS
# ===================================================================

def adicionar_arquivo(paciente_id, tipo, nome_original, nome_stored, mime_type, descricao=""):
    conn = conectar()
    conn.execute(
        """
    INSERT INTO arquivos
    (paciente_id, tipo, nome_original, nome_stored, mime_type, descricao, criado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            paciente_id,
            tipo,
            nome_original,
            nome_stored,
            mime_type,
            descricao,
            datetime.now().strftime("%d/%m/%Y %H:%M"),
        ),
    )
    conn.commit()
    conn.close()


def listar_arquivos_paciente(paciente_id):
    conn = conectar()
    dados = conn.execute(
        "SELECT * FROM arquivos WHERE paciente_id=? ORDER BY id DESC",
        (paciente_id,),
    ).fetchall()
    conn.close()
    return [dict(x) for x in dados]


# ===================================================================
# OPERAÇÕES DE ODONTOGRAMA
# ===================================================================

def salvar_condicao_dente(paciente_id, dente, face, condicao, codigo_sigtap=""):
    conn = conectar()
    conn.execute(
        "DELETE FROM odontograma WHERE paciente_id=? AND dente=? AND face=?",
        (paciente_id, dente, face),
    )
    conn.execute(
        """
    INSERT INTO odontograma (paciente_id, dente, face, condicao, codigo_sigtap)
    VALUES (?, ?, ?, ?, ?)
    """,
        (paciente_id, dente, face, condicao, codigo_sigtap),
    )
    conn.commit()
    conn.close()


def obter_odontograma_paciente(paciente_id):
    conn = conectar()
    dados = conn.execute("SELECT * FROM odontograma WHERE paciente_id=?", (paciente_id,)).fetchall()
    conn.close()

    resultado = {}
    for r in dados:
        dente = str(r["dente"])
        if dente not in resultado:
            resultado[dente] = {}
        resultado[dente][r["face"]] = r["condicao"]

    return resultado


# ===================================================================
# OPERAÇÕES DA AGENDA
# ===================================================================

def obter_agenda():
    conn = conectar()
    dados = conn.execute("SELECT * FROM agenda ORDER BY data_hora").fetchall()
    conn.close()
    return [dict(x) for x in dados]


# ===================================================================
# OPERAÇÕES DO PRONTUÁRIO SOAP
# ===================================================================

def salvar_soap(paciente_id, subjetivo, objetivo, avaliacao, plano):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO prontuario_soap (paciente_id, subjetivo, objetivo, avaliacao, plano)
        VALUES (?, ?, ?, ?, ?)
    """, (paciente_id, subjetivo, objetivo, avaliacao, plano))
    conn.commit()
    conn.close()


def listar_soap_paciente(paciente_id):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM prontuario_soap 
        WHERE paciente_id = ? 
        ORDER BY data_atendimento DESC
    """, (paciente_id,))
    registros = cursor.fetchall()
    conn.close()
    return registros


# ===================================================================
# ESTATÍSTICAS DO DASHBOARD
# ===================================================================

def obter_estatisticas_dashboard():
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM pacientes")
    total_pacientes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM agenda")
    total_agendamentos = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM prontuario_soap")
    total_prontuarios = cursor.fetchone()[0]

    cursor.execute("""
        SELECT procedimento, COUNT(*) as qtd 
        FROM agenda 
        WHERE procedimento IS NOT NULL AND procedimento != ''
        GROUP BY procedimento 
        ORDER BY qtd DESC LIMIT 5
    """)
    procedimentos_top = cursor.fetchall()

    conn.close()

    return {
        "pacientes": total_pacientes,
        "agendamentos": total_agendamentos,
        "prontuarios": total_prontuarios,
        "procedimentos_labels": [p[0] for p in procedimentos_top] if procedimentos_top else ["Nenhum procedimento registrado"],
        "procedimentos_qtds": [p[1] for p in procedimentos_top] if procedimentos_top else [0]
    }


# Inicialização automática ao carregar o arquivo
criar_tabelas()
criar_usuario_admin_inicial()