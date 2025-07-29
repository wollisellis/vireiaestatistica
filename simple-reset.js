// ========================================
// SIMPLE STUDENT RESET - CONSOLE VERSION
// ========================================
// Cole este script no console quando estiver logado como professor

console.log('🚀 Simple Student Reset Script');
console.log('===============================');

// Função para tentar diferentes formas de acessar Firestore
function getFirestore() {
  // Tentar diferentes formas de acessar o Firestore
  if (window.db) return window.db;
  if (window.firebase?.firestore) return window.firebase.firestore();
  if (window.firebase?.app()?.firestore) return window.firebase.app().firestore();
  
  // Tentar acessar através de imports dinâmicos
  try {
    const { getFirestore } = window.firebase;
    if (getFirestore) return getFirestore();
  } catch (e) {}
  
  return null;
}

// Inicializar Firestore
const db = getFirestore();

if (!db) {
  console.error('❌ Não foi possível acessar o Firestore');
  console.log('Variáveis disponíveis:', Object.keys(window).filter(k => k.includes('fire')));
  throw new Error('Firestore não disponível');
}

console.log('✅ Firestore conectado!');

// Função simples para contar documentos
async function countDocs(collection, where = null) {
  try {
    let query = db.collection(collection);
    if (where) {
      query = query.where(where.field, '==', where.value);
    }
    const snapshot = await query.get();
    return snapshot.size;
  } catch (error) {
    console.warn(`Erro ao contar ${collection}:`, error.message);
    return 0;
  }
}

// Função para deletar documentos
async function deleteDocs(collection, where = null) {
  try {
    let query = db.collection(collection);
    if (where) {
      query = query.where(where.field, '==', where.value);
    }
    
    const snapshot = await query.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error(`Erro ao deletar ${collection}:`, error.message);
    return 0;
  }
}

// Comandos principais
window.SimpleReset = {
  // Verificar status
  async status() {
    console.log('📊 Verificando status...');
    
    const professors = await countDocs('users', { field: 'role', value: 'professor' });
    const students = await countDocs('users', { field: 'role', value: 'student' });
    const scores = await countDocs('unified_scores');
    const progress = await countDocs('userProgress');
    
    const status = { professors, students, scores, progress };
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
      { name: 'exercise_attempts' }
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
      { name: 'quiz_sessions' }
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

// Instruções
console.log('\n🎮 Comandos disponíveis:');
console.log('SimpleReset.status() - Verificar status');
console.log('SimpleReset.dryRun() - Simular reset');
console.log('SimpleReset.reset() - Reset REAL');
console.log('SimpleReset.full() - Processo completo');
console.log('\n💡 Execute: SimpleReset.full()');
console.log('⚠️ ATENÇÃO: Reset real DELETA dados permanentemente!');

// ========================================
// INSTRUÇÕES:
// 1. Vá para https://avalianutri.vercel.app/professor
// 2. Faça login como professor
// 3. Abra console (F12)
// 4. Cole este script
// 5. Execute: SimpleReset.full()
// ========================================
