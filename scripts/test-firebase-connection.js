#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE TESTE - CONEXÃO FIREBASE
 * 
 * Este script testa a conectividade com o Firebase e verifica os dados
 * existentes para diagnosticar problemas no ranking.
 * 
 * Uso: node scripts/test-firebase-connection.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, getDoc, query, where, orderBy, limit } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBewwJJhJJhJJhJJhJJhJJhJJhJJhJJhJJ", // Placeholder - usar variáveis de ambiente
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:abc123def456ghi789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('🔥 Iniciando teste de conexão Firebase...\n');

async function testFirebaseConnection() {
  try {
    console.log('📡 Testando conectividade básica...');
    
    // Teste 1: Verificar coleções principais
    console.log('\n📊 Verificando coleções principais:');
    
    const collections = [
      'users',
      'unified_scores', 
      'classStudents',
      'classes'
    ];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`✅ ${collectionName}: ${snapshot.size} documentos`);
        
        if (snapshot.size > 0) {
          console.log(`   📋 Primeiros documentos:`);
          snapshot.docs.slice(0, 3).forEach((doc, index) => {
            console.log(`   ${index + 1}. ID: ${doc.id}`);
            console.log(`      Dados: ${JSON.stringify(doc.data(), null, 2).substring(0, 100)}...`);
          });
        }
      } catch (error) {
        console.log(`❌ ${collectionName}: Erro - ${error.message}`);
      }
    }
    
    // Teste 2: Verificar dados específicos do ranking
    console.log('\n🏆 Verificando dados específicos do ranking:');
    
    // Verificar unified_scores
    try {
      const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
      console.log(`📊 unified_scores: ${scoresSnapshot.size} registros`);
      
      scoresSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   🎯 ${doc.id}: ${data.totalScore || 0} pontos`);
        if (data.moduleScores) {
          Object.entries(data.moduleScores).forEach(([module, score]) => {
            console.log(`      📚 ${module}: ${score} pontos`);
          });
        }
      });
    } catch (error) {
      console.log(`❌ unified_scores: ${error.message}`);
    }
    
    // Verificar classStudents
    try {
      const studentsSnapshot = await getDocs(collection(db, 'classStudents'));
      console.log(`👥 classStudents: ${studentsSnapshot.size} matrículas`);
      
      studentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   👤 ${doc.id}: studentId=${data.studentId}, classId=${data.classId}`);
      });
    } catch (error) {
      console.log(`❌ classStudents: ${error.message}`);
    }
    
    // Verificar users
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log(`👤 users: ${usersSnapshot.size} usuários`);
      
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   👤 ${doc.id}: ${data.fullName || data.email || 'Sem nome'} (${data.role || 'Sem role'})`);
      });
    } catch (error) {
      console.log(`❌ users: ${error.message}`);
    }
    
    // Teste 3: Simular busca do ranking
    console.log('\n🔍 Simulando busca do ranking:');
    
    try {
      // Buscar estudantes com pontuação
      const scoresQuery = query(
        collection(db, 'unified_scores'),
        orderBy('totalScore', 'desc'),
        limit(10)
      );
      
      const scoresSnapshot = await getDocs(scoresQuery);
      console.log(`🏆 Ranking simulado (${scoresSnapshot.size} estudantes):`);
      
      scoresSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}º lugar: ${doc.id} - ${data.totalScore || 0} pontos`);
      });
      
    } catch (error) {
      console.log(`❌ Erro na busca do ranking: ${error.message}`);
    }
    
    console.log('\n✅ Teste de conexão Firebase concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testFirebaseConnection()
  .then(() => {
    console.log('\n🎯 Teste finalizado. Verifique os resultados acima.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
