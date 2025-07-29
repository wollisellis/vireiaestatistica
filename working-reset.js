// ========================================
// WORKING STUDENT RESET - CONSOLE VERSION
// ========================================
// Cole este script no console quando estiver logado como professor

console.log('🚀 Working Student Reset Script');
console.log('===============================');

// Função principal que inicializa tudo
async function initStudentReset() {
  console.log('🔥 Inicializando Student Reset...');
  
  let db = null;
  let firebaseModules = {};
  
  // Tentar diferentes formas de acessar Firebase
  if (window.db) {
    console.log('✅ Usando window.db');
    db = window.db;
  } else {
    console.log('📦 Tentando importar Firebase...');
    
    try {
      // Importar Firebase v9+
      const firebaseApp = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
      const firebaseFirestore = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
      
      const { initializeApp } = firebaseApp;
      const { getFirestore, collection, getDocs, query, where, writeBatch } = firebaseFirestore;
      
      // Configuração
      const firebaseConfig = {
        apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
        authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
        projectId: "vireiestatistica-ba7c5",
        storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
        messagingSenderId: "717809660419",
        appId: "1:717809660419:web:564836c9876cf33d2a9436"
      };
      
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      firebaseModules = { collection, getDocs, query, where, writeBatch };
      
      console.log('✅ Firebase importado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao importar Firebase:', error);
      
      // Fallback para Firebase compat
      if (window.firebase?.firestore) {
        console.log('🔄 Usando Firebase compat como fallback');
        db = window.firebase.firestore();
      } else {
        throw new Error('Firebase não disponível');
      }
    }
  }
  
  if (!db) {
    throw new Error('Não foi possível inicializar Firebase');
  }
  
  // Função para contar documentos
  async function countDocs(collectionName, whereClause = null) {
    try {
      let snapshot;
      
      // Firebase v9+ modular
      if (firebaseModules.collection && firebaseModules.getDocs) {
        const { collection, query, where, getDocs } = firebaseModules;
        
        let firestoreQuery = collection(db, collectionName);
        if (whereClause) {
          firestoreQuery = query(firestoreQuery, where(whereClause.field, '==', whereClause.value));
        }
        
        snapshot = await getDocs(firestoreQuery);
      }
      // Firebase compat
      else {
        let query = db.collection(collectionName);
        if (whereClause) {
          query = query.where(whereClause.field, '==', whereClause.value);
        }
        snapshot = await query.get();
      }
      
      return snapshot.size;
    } catch (error) {
      console.warn(`Erro ao contar ${collectionName}:`, error.message);
      return 0;
    }
  }
  
  // Função para deletar documentos
  async function deleteDocs(collectionName, whereClause = null) {
    try {
      let snapshot;
      
      // Firebase v9+ modular
      if (firebaseModules.collection && firebaseModules.getDocs) {
        const { collection, query, where, getDocs, writeBatch } = firebaseModules;
        
        let firestoreQuery = collection(db, collectionName);
        if (whereClause) {
          firestoreQuery = query(firestoreQuery, where(whereClause.field, '==', whereClause.value));
        }
        
        snapshot = await getDocs(firestoreQuery);
        const batch = writeBatch(db);
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
      // Firebase compat
      else {
        let query = db.collection(collectionName);
        if (whereClause) {
          query = query.where(whereClause.field, '==', whereClause.value);
        }
        
        snapshot = await query.get();
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
      
      return snapshot.size;
    } catch (error) {
      console.error(`Erro ao deletar ${collectionName}:`, error.message);
      return 0;
    }
  }
  
  // Comandos disponíveis
  const commands = {
    // Verificar status
    async status() {
      console.log('📊 Verificando status...');
      
      const professors = await countDocs('users', { field: 'role', value: 'professor' });
      const students = await countDocs('users', { field: 'role', value: 'student' });
      const scores = await countDocs('unified_scores');
      const progress = await countDocs('userProgress');
      const classStudents = await countDocs('classStudents');
      
      const status = { professors, students, scores, progress, classStudents };
      console.table(status);
      
      if (professors === 0) {
        console.error('🚨 CRÍTICO: Nenhum professor encontrado!');
        return false;
      }
      
      return status;
    },

    // Simular reset
    async dryRun() {
      console.log('🛡️ Simulando reset...');
      
      const collections = [
        { name: 'users', where: { field: 'role', value: 'student' } },
        { name: 'unified_scores' },
        { name: 'userProgress' },
        { name: 'classStudents' },
        { name: 'quiz_attempts' },
        { name: 'exercise_attempts' },
        { name: 'achievements' },
        { name: 'quiz_sessions' }
      ];
      
      let total = 0;
      const results = [];
      
      for (const col of collections) {
        const count = await countDocs(col.name, col.where);
        total += count;
        results.push({ collection: col.name, documents: count });
        console.log(`📋 ${col.name}: ${count} documentos`);
      }
      
      console.log(`\n🎯 Total que seria deletado: ${total}`);
      console.table(results);
      
      return { total, results };
    },

    // Reset real
    async reset() {
      console.log('🚨 EXECUTANDO RESET REAL!');
      
      const confirmed = confirm('⚠️ ATENÇÃO: Deletar TODOS os dados dos estudantes?\n\nEsta ação NÃO PODE SER DESFEITA!');
      if (!confirmed) {
        console.log('❌ Cancelado');
        return false;
      }

      const confirmText = prompt('Digite "CONFIRMO" para prosseguir:');
      if (confirmText !== 'CONFIRMO') {
        console.log('❌ Confirmação incorreta');
        return false;
      }

      const collections = [
        { name: 'users', where: { field: 'role', value: 'student' } },
        { name: 'unified_scores' },
        { name: 'userProgress' },
        { name: 'classStudents' },
        { name: 'quiz_attempts' },
        { name: 'exercise_attempts' },
        { name: 'achievements' },
        { name: 'quiz_sessions' },
        { name: 'randomized_quizzes' },
        { name: 'student_module_progress' }
      ];

      let totalDeleted = 0;
      const results = [];

      for (const col of collections) {
        console.log(`🗑️ Deletando ${col.name}...`);
        const deleted = await deleteDocs(col.name, col.where);
        totalDeleted += deleted;
        results.push({ collection: col.name, deleted });
        console.log(`✅ ${col.name}: ${deleted} deletados`);
      }

      console.log(`\n🎯 Total deletado: ${totalDeleted}`);
      console.table(results);

      return { totalDeleted, results };
    },

    // Processo completo
    async full() {
      console.log('🔄 Processo completo...\n');
      
      // 1. Status
      const status = await this.status();
      if (!status) return false;

      console.log('\n' + '='.repeat(40));
      
      // 2. Dry run
      const dryRun = await this.dryRun();
      
      // 3. Confirmação
      const proceed = confirm(`Dry run concluído!\n\n${dryRun.total} documentos serão deletados.\n\nExecutar reset REAL?`);
      
      if (proceed) {
        console.log('\n' + '='.repeat(40));
        return await this.reset();
      } else {
        console.log('✅ Finalizado no dry run');
        return dryRun;
      }
    }
  };
  
  // Disponibilizar comandos globalmente
  window.StudentReset = commands;
  
  console.log('\n🎮 Comandos disponíveis:');
  console.log('StudentReset.status() - Verificar status');
  console.log('StudentReset.dryRun() - Simular reset');
  console.log('StudentReset.reset() - Reset REAL');
  console.log('StudentReset.full() - Processo completo');
  console.log('\n💡 Execute: StudentReset.full()');
  console.log('⚠️ ATENÇÃO: Reset real DELETA dados permanentemente!');
  console.log('\n✅ Script inicializado com sucesso!');
  
  return commands;
}

// Inicializar automaticamente
initStudentReset().catch(error => {
  console.error('💥 Erro na inicialização:', error);
  console.log('\n🔧 Soluções:');
  console.log('1. Certifique-se de estar logado como professor');
  console.log('2. Recarregue a página e tente novamente');
  console.log('3. Verifique se não há bloqueadores de script');
});

// ========================================
// INSTRUÇÕES:
// 1. Vá para https://avalianutri.vercel.app/professor
// 2. Faça login como professor
// 3. Abra console (F12)
// 4. Cole este script
// 5. Aguarde inicialização
// 6. Execute: StudentReset.full()
// ========================================
