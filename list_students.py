#!/usr/bin/env python3
"""
Script para listar todos os estudantes registrados no Firestore do projeto Bioestat
"""

import os
import sys
from datetime import datetime

try:
    from google.cloud import firestore
    from google.oauth2 import service_account
except ImportError:
    print("❌ Erro: google-cloud-firestore não está instalado")
    print("📦 Instale com: pip install google-cloud-firestore")
    sys.exit(1)

# Configuração do Firebase
PROJECT_ID = "vireiestatistica-ba7c5"

def init_firestore():
    """Inicializa o cliente Firestore"""
    try:
        # Tenta usar credenciais padrão do ambiente
        db = firestore.Client(project=PROJECT_ID)
        return db
    except Exception as e:
        print(f"❌ Erro ao inicializar Firestore: {e}")
        print("💡 Tentando método alternativo...")

        # Método alternativo: usar variáveis de ambiente
        try:
            # Cria credenciais temporárias usando as informações do projeto
            os.environ['GOOGLE_CLOUD_PROJECT'] = PROJECT_ID
            db = firestore.Client()
            return db
        except Exception as e2:
            print(f"❌ Erro no método alternativo: {e2}")
            print("💡 Dica: Execute 'gcloud auth application-default login' primeiro")
            print("💡 Ou configure as credenciais do Firebase adequadamente")
            return None

def format_timestamp(timestamp):
    """Formata timestamp para exibição"""
    if timestamp is None:
        return "N/A"
    
    if hasattr(timestamp, 'timestamp'):
        # Firestore timestamp
        dt = datetime.fromtimestamp(timestamp.timestamp())
    elif isinstance(timestamp, str):
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except:
            return timestamp
    else:
        return str(timestamp)
    
    return dt.strftime("%d/%m/%Y %H:%M")

def list_students():
    """Lista todos os estudantes registrados no Firestore"""
    print("🔥 Conectando ao Firestore...")

    db = init_firestore()
    if not db:
        return
    
    try:
        print("👥 Buscando usuários na coleção 'users'...")
        
        # Busca todos os usuários
        users_ref = db.collection('users')
        docs = users_ref.stream()
        
        students = []
        professors = []
        others = []
        
        for doc in docs:
            data = doc.to_dict()
            user_info = {
                'id': doc.id,
                'email': data.get('email', 'N/A'),
                'fullName': data.get('fullName', 'N/A'),
                'role': data.get('role', 'N/A'),
                'anonymousId': data.get('anonymousId', 'N/A'),
                'institutionId': data.get('institutionId', 'N/A'),
                'totalScore': data.get('totalScore', 0),
                'levelReached': data.get('levelReached', 1),
                'gamesCompleted': data.get('gamesCompleted', 0),
                'createdAt': data.get('createdAt'),
                'updatedAt': data.get('updatedAt'),
                'authProvider': data.get('authProvider', 'N/A')
            }
            
            if data.get('role') == 'student':
                students.append(user_info)
            elif data.get('role') == 'professor':
                professors.append(user_info)
            else:
                others.append(user_info)
        
        # Exibe resultados
        print("\n" + "="*80)
        print(f"📊 RESUMO GERAL")
        print("="*80)
        print(f"👨‍🎓 Total de Estudantes: {len(students)}")
        print(f"👨‍🏫 Total de Professores: {len(professors)}")
        print(f"❓ Outros usuários: {len(others)}")
        print(f"📈 Total geral: {len(students) + len(professors) + len(others)}")
        
        if students:
            print("\n" + "="*80)
            print("👨‍🎓 ESTUDANTES REGISTRADOS")
            print("="*80)
            
            for i, student in enumerate(students, 1):
                print(f"\n📝 Estudante #{i}")
                print(f"   🆔 ID: {student['id']}")
                print(f"   📧 Email: {student['email']}")
                print(f"   👤 Nome: {student['fullName']}")
                print(f"   🎭 ID Anônimo: {student['anonymousId']}")
                print(f"   🏫 Instituição: {student['institutionId']}")
                print(f"   🎯 Pontuação Total: {student['totalScore']}")
                print(f"   📊 Nível Alcançado: {student['levelReached']}")
                print(f"   🎮 Jogos Completados: {student['gamesCompleted']}")
                print(f"   🔐 Provedor Auth: {student['authProvider']}")
                print(f"   📅 Criado em: {format_timestamp(student['createdAt'])}")
                print(f"   🔄 Atualizado em: {format_timestamp(student['updatedAt'])}")
        else:
            print("\n❌ Nenhum estudante encontrado na base de dados")
        
        if professors:
            print("\n" + "="*80)
            print("👨‍🏫 PROFESSORES REGISTRADOS")
            print("="*80)
            
            for i, prof in enumerate(professors, 1):
                print(f"\n📝 Professor #{i}")
                print(f"   🆔 ID: {prof['id']}")
                print(f"   📧 Email: {prof['email']}")
                print(f"   👤 Nome: {prof['fullName']}")
                print(f"   🏫 Instituição: {prof['institutionId']}")
                print(f"   🔐 Provedor Auth: {prof['authProvider']}")
                print(f"   📅 Criado em: {format_timestamp(prof['createdAt'])}")
        
        # Busca também outras coleções relevantes
        print("\n" + "="*80)
        print("📚 VERIFICANDO OUTRAS COLEÇÕES")
        print("="*80)
        
        # Verifica coleção de turmas
        try:
            classes_ref = db.collection('classes')
            classes_docs = list(classes_ref.stream())
            print(f"🏫 Turmas encontradas: {len(classes_docs)}")
            
            for class_doc in classes_docs:
                class_data = class_doc.to_dict()
                students_in_class = class_data.get('students', [])
                print(f"   📚 Turma '{class_data.get('name', 'N/A')}': {len(students_in_class)} estudantes")
        except Exception as e:
            print(f"⚠️ Erro ao verificar turmas: {e}")
        
        # Verifica progresso de jogos
        try:
            progress_ref = db.collection('gameProgress')
            progress_docs = list(progress_ref.stream())
            print(f"🎮 Registros de progresso: {len(progress_docs)}")
        except Exception as e:
            print(f"⚠️ Erro ao verificar progresso: {e}")
        
        print("\n✅ Consulta concluída!")
        
    except Exception as e:
        print(f"❌ Erro ao buscar dados: {e}")
        print(f"🔍 Detalhes: {type(e).__name__}")

if __name__ == "__main__":
    print("🚀 Script para listar estudantes do Bioestat Platform")
    print("📍 Projeto: vireiestatistica-ba7c5")
    print("-" * 50)
    
    list_students()
