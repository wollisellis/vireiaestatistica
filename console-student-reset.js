// ========================================
// STUDENT DATA RESET SCRIPT - CONSOLE VERSION
// ========================================
// Cole este script no console do navegador quando estiver logado como professor
// na página https://avalianutri.vercel.app/professor

console.log('🚀 Student Data Reset Script - Console Version');
console.log('================================================');

// Função para inicializar Firebase dinamicamente
async function initializeFirebase() {
  console.log('🔥 Tentando inicializar Firebase...');

  // Tentativa 1: Usar Firebase já disponível na aplicação
  if (window.db) {
    console.log('✅ Firebase encontrado: window.db');
    return window.db;
  }

  // Tentativa 2: Importar Firebase dinamicamente
  try {
    console.log('📦 Importando Firebase dinamicamente...');

    // Importar Firebase v9+
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, where, writeBatch } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');

    // Configuração do Firebase (mesma do projeto)
    const firebaseConfig = {
      apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
      authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
      projectId: "vireiestatistica-ba7c5",
      storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
      messagingSenderId: "717809660419",
      appId: "1:717809660419:web:564836c9876cf33d2a9436"
    };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Salvar globalmente para reutilização
    window.db = db;
    window.firebaseModules = { collection, getDocs, query, where, writeBatch };

    console.log('✅ Firebase inicializado dinamicamente!');
    return db;

  } catch (error) {
    console.error('❌ Erro ao importar Firebase:', error);
  }

  // Tentativa 3: Firebase compat (fallback)
  if (window.firebase?.firestore) {
    console.log('✅ Firebase encontrado: firebase.firestore()');
    return window.firebase.firestore();
  }

  // Diagnóstico
  console.error('❌ Firebase não está disponível. Diagnóstico:');
  console.log('- window.db:', !!window.db);
  console.log('- window.firebase:', !!window.firebase);
  console.log('- Variáveis window:', Object.keys(window).filter(k => k.toLowerCase().includes('fire')));

  console.log('\n🔧 Soluções:');
  console.log('1. Certifique-se de estar na página da aplicação logado como professor');
  console.log('2. Aguarde a página carregar completamente');
  console.log('3. Recarregue a página e tente novamente');
  console.log('4. Verifique se há bloqueadores de script');

  throw new Error('Firebase não disponível - verifique as soluções acima');
}

// Inicializar Firebase
let db = null;
let firebaseModules = null;

try {
  db = await initializeFirebase();
  firebaseModules = window.firebaseModules || {};
  console.log('🎯 Firebase pronto para uso!');
} catch (error) {
  console.error('💥 Falha crítica na inicialização:', error);
  throw error;
}

// Coleções para reset
const COLLECTIONS_TO_RESET = [
  { name: 'users', condition: { field: 'role', value: 'student' }, description: 'Contas de estudantes' },
  { name: 'unified_scores', description: 'Pontuações dos estudantes' },
  { name: 'userProgress', description: 'Progresso dos usuários' },
  { name: 'classStudents', description: 'Relacionamentos estudante-turma' },
  { name: 'student_module_progress', description: 'Progresso nos módulos' },
  { name: 'quiz_attempts', description: 'Tentativas de quiz' },
  { name: 'randomized_quizzes', description: 'Quizzes aleatórios' },
  { name: 'quiz_sessions', description: 'Sessões de quiz' },
  { name: 'exercise_attempts', description: 'Tentativas de exercícios' },
  { name: 'achievements', description: 'Conquistas dos estudantes' }
];

// Função auxiliar para executar query Firestore
async function executeFirestoreQuery(collectionName, whereClause = null) {
  try {
    // Firebase v9+ (modular) - método preferido
    if (firebaseModules.collection && firebaseModules.query && firebaseModules.getDocs) {
      const { collection, query, where, getDocs } = firebaseModules;

      let firestoreQuery = collection(db, collectionName);
      if (whereClause) {
        firestoreQuery = query(firestoreQuery, where(whereClause.field, '==', whereClause.value));
      }

      return await getDocs(firestoreQuery);
    }
    // Firebase compat (fallback)
    else if (db.collection) {
      let query = db.collection(collectionName);
      if (whereClause) {
        query = query.where(whereClause.field, '==', whereClause.value);
      }
      return await query.get();
    }
    else {
      throw new Error('Método de query não suportado');
    }
  } catch (error) {
    console.error(`Erro ao executar query em ${collectionName}:`, error);
    throw error;
  }
}

// Função para verificar status
async function checkSystemStatus() {
  console.log('📊 Verificando status do sistema...');

  try {
    const status = { professors: 0, students: 0, totalStudentData: 0 };

    // Contar professores
    const professorsSnapshot = await executeFirestoreQuery('users', { field: 'role', value: 'professor' });
    status.professors = professorsSnapshot.size;

    // Contar estudantes
    const studentsSnapshot = await executeFirestoreQuery('users', { field: 'role', value: 'student' });
    status.students = studentsSnapshot.size;

    // Contar dados de estudantes
    for (const collection of COLLECTIONS_TO_RESET) {
      if (collection.name === 'users') continue;
      try {
        const snapshot = await executeFirestoreQuery(collection.name);
        status.totalStudentData += snapshot.size;
      } catch (error) {
        console.warn(`⚠️ Erro ao acessar ${collection.name}:`, error.message);
      }
    }

    console.log('✅ Status do sistema:');
    console.table(status);
    
    if (status.professors === 0) {
      console.error('🚨 CRÍTICO: Nenhum professor encontrado!');
      return false;
    }

    return status;
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return false;
  }
}

// Função para dry run
async function executeDryRun() {
  console.log('🛡️ Executando DRY RUN (simulação)...');
  
  const report = { totalFound: 0, collections: [] };

  for (const collection of COLLECTIONS_TO_RESET) {
    console.log(`🔍 Analisando ${collection.name}...`);
    
    try {
      let snapshot;

      if (collection.condition) {
        snapshot = await executeFirestoreQuery(collection.name, collection.condition);
      } else {
        snapshot = await executeFirestoreQuery(collection.name);
      }

      const found = snapshot.size;
      report.totalFound += found;
      report.collections.push({ name: collection.name, found, description: collection.description });
      
      console.log(`  📋 ${collection.name}: ${found} documentos seriam deletados`);
      
    } catch (error) {
      console.warn(`  ⚠️ Erro ao acessar ${collection.name}:`, error.message);
    }
  }

  console.log('\n📊 Resumo do DRY RUN:');
  console.table(report.collections);
  console.log(`\n🎯 Total de documentos que seriam deletados: ${report.totalFound}`);

  return report;
}

// Função para reset real
async function executeRealReset() {
  console.log('🚨 EXECUTANDO RESET REAL - DADOS SERÃO DELETADOS!');
  
  // Confirmação dupla
  const confirmed1 = confirm('⚠️ ATENÇÃO: Esta operação irá DELETAR PERMANENTEMENTE todos os dados dos estudantes!\n\nDeseja continuar?');
  if (!confirmed1) {
    console.log('❌ Operação cancelada pelo usuário');
    return false;
  }

  const confirmText = prompt('Digite "CONFIRMO" para prosseguir:');
  if (confirmText !== 'CONFIRMO') {
    console.log('❌ Confirmação incorreta. Operação cancelada.');
    return false;
  }

  const report = { totalDeleted: 0, collections: [], errors: [] };

  for (const collection of COLLECTIONS_TO_RESET) {
    console.log(`🗑️ Deletando ${collection.name}...`);
    
    try {
      let snapshot;
      
      if (collection.condition) {
        snapshot = await db.collection(collection.name)
          .where(collection.condition.field, '==', collection.condition.value)
          .get();
      } else {
        snapshot = await db.collection(collection.name).get();
      }

      const batch = db.batch();
      let batchCount = 0;
      let deleted = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        batchCount++;
        
        if (batchCount >= 500) { // Limite do Firestore
          await batch.commit();
          deleted += batchCount;
          console.log(`  💾 Batch commitado: ${deleted}/${snapshot.size}`);
          batchCount = 0;
        }
      }

      // Commit último batch
      if (batchCount > 0) {
        await batch.commit();
        deleted += batchCount;
      }

      report.totalDeleted += deleted;
      report.collections.push({ name: collection.name, deleted });
      
      console.log(`  ✅ ${collection.name}: ${deleted} documentos deletados`);
      
    } catch (error) {
      console.error(`  ❌ Erro ao deletar ${collection.name}:`, error.message);
      report.errors.push({ collection: collection.name, error: error.message });
    }
  }

  console.log('\n📊 Relatório Final:');
  console.table(report.collections);
  console.log(`\n🎯 Total deletado: ${report.totalDeleted}`);
  
  if (report.errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    console.table(report.errors);
  }

  return report;
}

// Comandos disponíveis
window.StudentReset = {
  // Verificar status do sistema
  async status() {
    return await checkSystemStatus();
  },
  
  // Executar simulação
  async dryRun() {
    return await executeDryRun();
  },
  
  // Executar reset real
  async reset() {
    return await executeRealReset();
  },
  
  // Processo completo
  async full() {
    console.log('🔄 Executando processo completo...\n');
    
    // 1. Status
    const status = await checkSystemStatus();
    if (!status) {
      console.error('🚨 Sistema não está saudável. Abortando.');
      return false;
    }

    console.log('\n' + '='.repeat(50));
    
    // 2. Dry run
    const dryRun = await executeDryRun();
    
    // 3. Confirmação
    const proceed = confirm(`Dry run concluído!\n\n${dryRun.totalFound} documentos serão deletados.\n\nDeseja executar o reset REAL?`);
    
    if (proceed) {
      console.log('\n' + '='.repeat(50));
      return await executeRealReset();
    } else {
      console.log('✅ Processo finalizado no dry run.');
      return dryRun;
    }
  }
};

// Instruções
console.log('\n🎮 Comandos disponíveis:');
console.log('  StudentReset.status() - Verificar status do sistema');
console.log('  StudentReset.dryRun() - Simular reset (seguro)');
console.log('  StudentReset.reset() - Executar reset REAL (PERIGOSO!)');
console.log('  StudentReset.full() - Processo completo guiado');
console.log('\n💡 Recomendação: Execute StudentReset.full() para processo completo');
console.log('⚠️ ATENÇÃO: O reset real irá DELETAR PERMANENTEMENTE todos os dados dos estudantes!');
console.log('\n✅ Script carregado com sucesso! Execute StudentReset.full() para começar.');

// ========================================
// INSTRUÇÕES DE USO:
// ========================================
// 1. Abra https://avalianutri.vercel.app/professor
// 2. Faça login como professor
// 3. Abra o console do navegador (F12)
// 4. Cole todo este script e pressione Enter
// 5. Execute: StudentReset.full()
// ========================================
