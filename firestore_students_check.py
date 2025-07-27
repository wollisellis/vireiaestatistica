#!/usr/bin/env python3
"""
Script para listar estudantes registrados no Firestore usando pyrebase4
"""

import pyrebase
from datetime import datetime
import json

# Configuração do Firebase (mesma do projeto)
firebase_config = {
    "apiKey": "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
    "authDomain": "vireiestatistica-ba7c5.firebaseapp.com",
    "projectId": "vireiestatistica-ba7c5",
    "storageBucket": "vireiestatistica-ba7c5.firebasestorage.app",
    "messagingSenderId": "717809660419",
    "appId": "1:717809660419:web:564836c9876cf33d2a9436",
    "databaseURL": "https://vireiestatistica-ba7c5-default-rtdb.firebaseio.com/"
}

def format_timestamp(timestamp):
    """Formata timestamp para exibição"""
    if not timestamp:
        return "N/A"
    
    try:
        if isinstance(timestamp, str):
            # Remove 'Z' e converte para datetime
            if timestamp.endswith('Z'):
                timestamp = timestamp[:-1] + '+00:00'
            dt = datetime.fromisoformat(timestamp)
            return dt.strftime("%d/%m/%Y %H:%M")
        else:
            return str(timestamp)
    except:
        return str(timestamp)

def main():
    """Função principal"""
    print("🚀 Script para verificar estudantes no Firestore")
    print(f"📍 Projeto: {firebase_config['projectId']}")
    print("-" * 60)
    
    try:
        # Inicializar Firebase
        print("🔥 Inicializando Firebase...")
        firebase = pyrebase.initialize_app(firebase_config)
        db = firebase.database()
        
        print("✅ Firebase inicializado com sucesso!")
        
        # Tentar acessar Firestore via pyrebase (que na verdade acessa Realtime Database)
        print("⚠️ Nota: pyrebase4 acessa Realtime Database, não Firestore")
        print("🔍 Tentando buscar dados de usuários...")
        
        # Buscar dados de usuários
        try:
            users_data = db.child("users").get()
            
            if users_data.val():
                print(f"✅ Encontrados dados de usuários!")
                users = users_data.val()
                
                students = []
                professors = []
                others = []
                
                for user_id, user_data in users.items():
                    role = user_data.get('role', 'N/A')
                    
                    user_info = {
                        'id': user_id,
                        'email': user_data.get('email', 'N/A'),
                        'fullName': user_data.get('fullName', 'N/A'),
                        'role': role,
                        'anonymousId': user_data.get('anonymousId', 'N/A'),
                        'institutionId': user_data.get('institutionId', 'N/A'),
                        'totalScore': user_data.get('totalScore', 0),
                        'levelReached': user_data.get('levelReached', 1),
                        'gamesCompleted': user_data.get('gamesCompleted', 0),
                        'createdAt': user_data.get('createdAt', 'N/A'),
                        'updatedAt': user_data.get('updatedAt', 'N/A'),
                        'authProvider': user_data.get('authProvider', 'N/A')
                    }
                    
                    if role == 'student':
                        students.append(user_info)
                    elif role == 'professor':
                        professors.append(user_info)
                    else:
                        others.append(user_info)
                
                # Exibir resultados
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
                
            else:
                print("❌ Nenhum dado encontrado na coleção 'users' do Realtime Database")
                
        except Exception as e:
            print(f"❌ Erro ao buscar dados de usuários: {e}")
        
        # Tentar buscar outras coleções
        print("\n" + "="*80)
        print("📚 VERIFICANDO OUTRAS COLEÇÕES")
        print("="*80)
        
        # Verificar turmas
        try:
            classes_data = db.child("classes").get()
            if classes_data.val():
                classes = classes_data.val()
                print(f"🏫 Turmas encontradas: {len(classes)}")
                
                for class_id, class_data in classes.items():
                    students_in_class = class_data.get('students', [])
                    class_name = class_data.get('name', 'N/A')
                    if isinstance(students_in_class, list):
                        print(f"   📚 Turma '{class_name}': {len(students_in_class)} estudantes")
                    elif isinstance(students_in_class, dict):
                        print(f"   📚 Turma '{class_name}': {len(students_in_class)} estudantes")
                    else:
                        print(f"   📚 Turma '{class_name}': dados de estudantes não são uma lista/dict")
            else:
                print("🏫 Nenhuma turma encontrada no Realtime Database")
        except Exception as e:
            print(f"⚠️ Erro ao verificar turmas: {e}")
        
        # Verificar progresso de jogos
        try:
            progress_data = db.child("gameProgress").get()
            if progress_data.val():
                progress = progress_data.val()
                print(f"🎮 Registros de progresso: {len(progress)}")
            else:
                print("🎮 Nenhum progresso de jogo encontrado")
        except Exception as e:
            print(f"⚠️ Erro ao verificar progresso: {e}")
        
        print("\n" + "="*80)
        print("💡 INFORMAÇÃO IMPORTANTE")
        print("="*80)
        print("⚠️ Este script acessa o Realtime Database do Firebase, não o Firestore.")
        print("📝 O projeto Bioestat usa Firestore, que é um banco de dados diferente.")
        print("🔧 Para acessar o Firestore, seria necessário usar credenciais de service account.")
        print("📚 Os dados mostrados acima são do Realtime Database (se existirem).")
        
        print("\n✅ Consulta concluída!")
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        print("💡 Verifique se:")
        print("   - As configurações do Firebase estão corretas")
        print("   - As regras de segurança permitem leitura")
        print("   - A conexão com a internet está funcionando")

if __name__ == "__main__":
    main()
