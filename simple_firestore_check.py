#!/usr/bin/env python3
"""
Script simples para verificar estudantes no Firestore usando API REST
"""

import requests
import json
from datetime import datetime

# Configuração do projeto
PROJECT_ID = "vireiestatistica-ba7c5"
API_KEY = "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0"  # Da .env.local

def format_timestamp(timestamp_str):
    """Formata timestamp para exibição"""
    if not timestamp_str:
        return "N/A"
    
    try:
        # Remove 'Z' e converte para datetime
        if timestamp_str.endswith('Z'):
            timestamp_str = timestamp_str[:-1] + '+00:00'
        dt = datetime.fromisoformat(timestamp_str)
        return dt.strftime("%d/%m/%Y %H:%M")
    except:
        return timestamp_str

def get_firestore_documents(collection_name):
    """Busca documentos de uma coleção usando API REST"""
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{collection_name}"
    
    params = {
        'key': API_KEY
    }
    
    try:
        print(f"🔍 Buscando coleção '{collection_name}'...")
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            print(f"✅ Encontrados {len(documents)} documentos em '{collection_name}'")
            return documents
        else:
            print(f"❌ Erro ao buscar '{collection_name}': {response.status_code}")
            print(f"📝 Resposta: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Erro na requisição para '{collection_name}': {e}")
        return []

def extract_field_value(field_data):
    """Extrai valor de um campo do Firestore"""
    if not field_data:
        return "N/A"
    
    # Firestore armazena valores em diferentes tipos
    if 'stringValue' in field_data:
        return field_data['stringValue']
    elif 'integerValue' in field_data:
        return int(field_data['integerValue'])
    elif 'doubleValue' in field_data:
        return float(field_data['doubleValue'])
    elif 'booleanValue' in field_data:
        return field_data['booleanValue']
    elif 'timestampValue' in field_data:
        return format_timestamp(field_data['timestampValue'])
    elif 'arrayValue' in field_data:
        values = field_data['arrayValue'].get('values', [])
        return [extract_field_value(v) for v in values]
    else:
        return str(field_data)

def parse_document(doc):
    """Converte documento do Firestore para formato legível"""
    doc_id = doc['name'].split('/')[-1]
    fields = doc.get('fields', {})
    
    parsed = {'id': doc_id}
    
    for field_name, field_data in fields.items():
        parsed[field_name] = extract_field_value(field_data)
    
    return parsed

def main():
    """Função principal"""
    print("🚀 Script para verificar estudantes no Firestore")
    print(f"📍 Projeto: {PROJECT_ID}")
    print("-" * 60)
    
    # Busca usuários
    users_docs = get_firestore_documents('users')
    
    if not users_docs:
        print("❌ Nenhum documento encontrado na coleção 'users'")
        print("💡 Verifique se:")
        print("   - O projeto está correto")
        print("   - A API key está válida")
        print("   - As regras do Firestore permitem leitura")
        return
    
    # Processa usuários
    students = []
    professors = []
    others = []
    
    for doc in users_docs:
        try:
            user = parse_document(doc)
            role = user.get('role', 'N/A')
            
            if role == 'student':
                students.append(user)
            elif role == 'professor':
                professors.append(user)
            else:
                others.append(user)
                
        except Exception as e:
            print(f"⚠️ Erro ao processar documento: {e}")
            continue
    
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
            print(f"   🆔 ID: {student.get('id', 'N/A')}")
            print(f"   📧 Email: {student.get('email', 'N/A')}")
            print(f"   👤 Nome: {student.get('fullName', 'N/A')}")
            print(f"   🎭 ID Anônimo: {student.get('anonymousId', 'N/A')}")
            print(f"   🏫 Instituição: {student.get('institutionId', 'N/A')}")
            print(f"   🎯 Pontuação Total: {student.get('totalScore', 0)}")
            print(f"   📊 Nível Alcançado: {student.get('levelReached', 1)}")
            print(f"   🎮 Jogos Completados: {student.get('gamesCompleted', 0)}")
            print(f"   🔐 Provedor Auth: {student.get('authProvider', 'N/A')}")
            print(f"   📅 Criado em: {student.get('createdAt', 'N/A')}")
            print(f"   🔄 Atualizado em: {student.get('updatedAt', 'N/A')}")
    else:
        print("\n❌ Nenhum estudante encontrado na base de dados")
    
    if professors:
        print("\n" + "="*80)
        print("👨‍🏫 PROFESSORES REGISTRADOS")
        print("="*80)
        
        for i, prof in enumerate(professors, 1):
            print(f"\n📝 Professor #{i}")
            print(f"   🆔 ID: {prof.get('id', 'N/A')}")
            print(f"   📧 Email: {prof.get('email', 'N/A')}")
            print(f"   👤 Nome: {prof.get('fullName', 'N/A')}")
            print(f"   🏫 Instituição: {prof.get('institutionId', 'N/A')}")
            print(f"   🔐 Provedor Auth: {prof.get('authProvider', 'N/A')}")
            print(f"   📅 Criado em: {prof.get('createdAt', 'N/A')}")
    
    # Verifica outras coleções
    print("\n" + "="*80)
    print("📚 VERIFICANDO OUTRAS COLEÇÕES")
    print("="*80)
    
    # Verifica turmas
    classes_docs = get_firestore_documents('classes')
    print(f"🏫 Turmas encontradas: {len(classes_docs)}")
    
    for doc in classes_docs:
        try:
            class_data = parse_document(doc)
            students_in_class = class_data.get('students', [])
            class_name = class_data.get('name', 'N/A')
            if isinstance(students_in_class, list):
                print(f"   📚 Turma '{class_name}': {len(students_in_class)} estudantes")
            else:
                print(f"   📚 Turma '{class_name}': dados de estudantes não são uma lista")
        except Exception as e:
            print(f"   ⚠️ Erro ao processar turma: {e}")
    
    # Verifica progresso de jogos
    progress_docs = get_firestore_documents('gameProgress')
    print(f"🎮 Registros de progresso: {len(progress_docs)}")
    
    print("\n✅ Consulta concluída!")

if __name__ == "__main__":
    main()
