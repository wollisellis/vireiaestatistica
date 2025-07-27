#!/usr/bin/env node

/**
 * Script temporário para verificar usuários no Firestore
 * Com regras permissivas aplicadas
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkXGBhJJJJJJJJJJJJJJJJJJJJJJJJJJJ",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  console.log('🔍 VERIFICANDO USUÁRIOS NO FIRESTORE');
  console.log('=====================================\n');

  try {
    // 1. Verificar coleção users
    console.log('👥 1. Verificando coleção "users"...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`   📊 Total de usuários encontrados: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      console.log('\n   📋 Lista de usuários:');
      console.log('   ' + '='.repeat(50));
      
      usersSnapshot.forEach((doc, index) => {
        const userData = doc.data();
        console.log(`   ${index + 1}. ID: ${doc.id}`);
        console.log(`      📧 Email: ${userData.email || 'N/A'}`);
        console.log(`      👤 Nome: ${userData.name || userData.displayName || 'N/A'}`);
        console.log(`      🎭 Tipo: ${userData.role || userData.userType || 'N/A'}`);
        console.log(`      📅 Criado: ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
        console.log('   ' + '-'.repeat(50));
      });
    }

    // 2. Verificar outras coleções relacionadas a usuários
    console.log('\n🔍 2. Verificando outras coleções...');
    
    const collections = ['class_students', 'gameProgress', 'unified_scores'];
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        console.log(`   📁 ${collectionName}: ${snapshot.size} documentos`);
        
        if (snapshot.size > 0 && snapshot.size <= 5) {
          snapshot.forEach(doc => {
            const data = doc.data();
            const email = data.email || data.userEmail || 'N/A';
            const userId = data.userId || data.studentId || doc.id;
            console.log(`      - ${userId}: ${email}`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Erro ao acessar ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
checkUsers().then(() => {
  console.log('\n🏁 Script finalizado.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
