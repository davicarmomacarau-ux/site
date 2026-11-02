<<<<<<< HEAD
"""Authenticated JSON endpoints for account administration."""

import secrets

import database
from flask import Blueprint, jsonify, request, session

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    if not session.get("user_id"):
        return jsonify({"message": "Autenticação necessária."}), 401
    if session.get("user_perfil") != "ADMIN":
        return jsonify({"message": "Apenas administradores podem cadastrar usuários."}), 403

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"message": "JSON inválido ou vazio."}), 400
    expected_token = session.get("_auth_csrf", "")
    submitted_token = request.headers.get("X-CSRF-Token", "")
    if not expected_token or not secrets.compare_digest(expected_token, submitted_token):
        return jsonify({"message": "Token de segurança inválido."}), 400

    try:
        created = database.cadastrar_usuario(
            data.get("nome", ""),
            data.get("usuario", ""),
            data.get("senha", ""),
            data.get("perfil", ""),
            data.get("registro_profissional", ""),
            data.get("cnes_unidade", ""),
        )
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    if not created:
        return jsonify({"message": "Esse nome de usuário já está cadastrado."}), 409
    return jsonify({"message": "Usuário cadastrado."}), 201
=======
from flask import Blueprint, request, jsonify
from database import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()

    if user:
        return jsonify({'message': 'Username already exists'}), 409
    else:
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
>>>>>>> origin/main
