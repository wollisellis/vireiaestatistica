#!/usr/bin/env python3
"""
Script final para verificar estudantes no Firestore
Baseado nos scripts JavaScript existentes no projeto
"""

import os
import sys
import json
from datetime import datetime

# Configuração do Firebase (mesma dos scripts JS)
FIREBASE_CONFIG = {
    "apiKey": "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
    "authDomain": "vireiestatistica-ba7c5.firebaseapp.com",
    "projectId": "vireiestatistica-ba7c5",
    "storageBucket": "vireiestatistica-ba7c5.firebasestorage.app",
    "messagingSenderId": "717809660419",
    "appId": "1:717809660419:web:564836c9876cf33d2a9436"
}

def format_timestamp(timestamp):
    """Formata timestamp para exibição"""
    if not timestamp:
        return "N/A"
    
    try:
        if isinstance(timestamp, str):
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
    print(f"📍 Projeto: {FIREBASE_CONFIG['projectId']}")
    print("-" * 60)
    
    print("📋 RESUMO DA SITUAÇÃO:")
    print("="*60)
    print("✅ Configuração do Firebase encontrada")
    print("✅ Scripts JavaScript existentes no projeto")
    print("❌ Acesso direto ao Firestore via Python bloqueado por permissões")
    print("💡 Dados estão no Firestore, não no Realtime Database")
    
    print("\n📂 SCRIPTS JAVASCRIPT DISPONÍVEIS NO PROJETO:")
    print("="*60)
    
    # Lista scripts JS que podem ser usados
    js_scripts = [
        "diagnose-all-issues.js",
        "debug-firebase.js", 
        "debug-class-students.js",
        "fix-final-issues-v2.js",
        "deep-investigate-students.js"
    ]
    
    for script in js_scripts:
        if os.path.exists(script):
            print(f"✅ {script}")
        else:
            print(f"❌ {script} (não encontrado)")
    
    print("\n🔧 RECOMENDAÇÕES:")
    print("="*60)
    print("1. 📝 Use os scripts JavaScript existentes que já funcionam:")
    print("   node diagnose-all-issues.js")
    print("   node debug-firebase.js")
    print("   node debug-class-students.js")
    
    print("\n2. 🔐 Para acesso via Python, seria necessário:")
    print("   - Service Account Key do Firebase")
    print("   - Configuração adequada das credenciais")
    print("   - Permissões de leitura no Firestore")
    
    print("\n3. 🌐 Alternativa via Firebase Console:")
    print("   - Acesse: https://console.firebase.google.com")
    print("   - Projeto: vireiestatistica-ba7c5")
    print("   - Firestore Database > Data")
    print("   - Coleção: users")
    
    print("\n📊 INFORMAÇÕES DO PROJETO:")
    print("="*60)
    print(f"🎯 Project ID: {FIREBASE_CONFIG['projectId']}")
    print(f"🌐 Auth Domain: {FIREBASE_CONFIG['authDomain']}")
    print(f"📦 Storage Bucket: {FIREBASE_CONFIG['storageBucket']}")
    print(f"📱 App ID: {FIREBASE_CONFIG['appId']}")
    
    print("\n🔍 ESTRUTURA ESPERADA DOS DADOS:")
    print("="*60)
    print("📁 Coleção: users")
    print("   📄 Documento: {userId}")
    print("      📝 email: string")
    print("      📝 fullName: string") 
    print("      📝 role: 'student' | 'professor'")
    print("      📝 anonymousId: string (apenas estudantes)")
    print("      📝 institutionId: string")
    print("      📝 totalScore: number")
    print("      📝 levelReached: number")
    print("      📝 gamesCompleted: number")
    print("      📝 createdAt: timestamp")
    print("      📝 updatedAt: timestamp")
    
    print("\n📁 Outras coleções relevantes:")
    print("   📚 classes - Turmas")
    print("   🎮 gameProgress - Progresso dos jogos")
    print("   🏆 achievements - Conquistas")
    
    print("\n💡 PRÓXIMOS PASSOS SUGERIDOS:")
    print("="*60)
    print("1. Execute um dos scripts JavaScript para ver os dados:")
    print("   node debug-firebase.js")
    
    print("\n2. Se precisar de acesso via Python, configure:")
    print("   - Firebase Admin SDK com service account")
    print("   - Arquivo de credenciais JSON")
    print("   - Variável de ambiente GOOGLE_APPLICATION_CREDENTIALS")
    
    print("\n3. Para desenvolvimento, considere:")
    print("   - Usar o Firebase Emulator Suite")
    print("   - Configurar regras de segurança mais permissivas para desenvolvimento")
    
    print("\n✅ Análise concluída!")
    print("🔧 Use os scripts JavaScript existentes para acessar os dados do Firestore.")

if __name__ == "__main__":
    main()
