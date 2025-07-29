// Script de Reset de Dados dos Estudantes - Para Console do Navegador
// Execute este script no console do navegador quando estiver logado como professor
// Baseado no studentDataResetScript.ts

console.log('🚀 Student Data Reset Script - Bioestat Platform');
console.log('================================================\n');

// Verificar se Firebase está disponível
if (typeof firebase === 'undefined' && typeof window.firebase === 'undefined') {
  console.error('❌ Firebase não está disponível. Certifique-se de estar na página da aplicação.');
  throw new Error('Firebase não disponível');
}

// Usar Firebase global ou importado
const db = window.db || firebase.firestore();

// Configurações do reset
const RESET_CONFIG = {
  dryRun: true, // Sempre começar em modo seguro
  createBackup: true,
  batchSize: 100,
  logLevel: 'detailed'
};

// Coleções para reset (organizadas por prioridade)
const RESET_OPERATIONS = [
  // Alta prioridade - Dados principais dos estudantes
  {
    collectionName: 'users',
    condition: { field: 'role', operator: '==', value: 'student' },
    priority: 'high',
    description: 'Contas de estudantes (preservar professores)'
  },
  {
    collectionName: 'unified_scores',
    priority: 'high',
    description: 'Pontuações unificadas dos estudantes'
  },
  {
    collectionName: 'userProgress',
    priority: 'high',
    description: 'Progresso geral dos usuários estudantes'
  },
  // Média prioridade - Relacionamentos
  {
    collectionName: 'classStudents',
    priority: 'medium',
    description: 'Relacionamento estudante-turma'
  },
  {
    collectionName: 'student_module_progress',
    priority: 'medium',
    description: 'Progresso dos estudantes nos módulos'
  },
  // Baixa prioridade - Histórico
  {
    collectionName: 'quiz_attempts',
    priority: 'low',
    description: 'Tentativas de quiz dos estudantes'
  },
  {
    collectionName: 'randomized_quizzes',
    priority: 'low',
    description: 'Quizzes aleatórios gerados'
  },
  {
    collectionName: 'quiz_sessions',
    priority: 'low',
    description: 'Sessões ativas de quiz'
  },
  {
    collectionName: 'exercise_attempts',
    priority: 'low',
    description: 'Tentativas de exercícios'
  },
  {
    collectionName: 'achievements',
    priority: 'low',
    description: 'Conquistas dos estudantes'
  }
];

// Função para verificar status do sistema
async function getSystemStatus() {
  console.log('📊 Verificando status do sistema...');
  
  try {
    const status = {
      professors: 0,
      students: 0,
      classes: 0,
      totalStudentData: 0,
      systemHealth: 'healthy'
    };

    // Contar professores
    const professorsQuery = db.collection('users').where('role', '==', 'professor');
    const professorsSnapshot = await professorsQuery.get();
    status.professors = professorsSnapshot.size;

    // Contar estudantes
    const studentsQuery = db.collection('users').where('role', '==', 'student');
    const studentsSnapshot = await studentsQuery.get();
    status.students = studentsSnapshot.size;

    // Contar turmas
    const classesSnapshot = await db.collection('classes').get();
    status.classes = classesSnapshot.size;

    // Contar dados de estudantes em outras coleções
    for (const operation of RESET_OPERATIONS) {
      if (operation.collectionName === 'users') continue;
      
      try {
        const snapshot = await db.collection(operation.collectionName).get();
        status.totalStudentData += snapshot.size;
      } catch (error) {
        console.warn(`⚠️ Não foi possível acessar ${operation.collectionName}:`, error.message);
      }
    }

    // Determinar saúde do sistema
    if (status.professors === 0) {
      status.systemHealth = 'critical';
    } else if (status.students > 1000) {
      status.systemHealth = 'warning';
    }

    console.log('✅ Status do sistema:');
    console.table(status);
    
    return status;
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return { systemHealth: 'critical', error: error.message };
  }
}

// Função para executar dry run
async function executeDryRun() {
  console.log('🛡️ Executando DRY RUN (simulação)...');
  
  const report = {
    timestamp: new Date(),
    totalCollections: 0,
    totalDocumentsFound: 0,
    results: [],
    executionTime: 0
  };

  const startTime = Date.now();

  for (const operation of RESET_OPERATIONS) {
    console.log(`🔍 Analisando ${operation.collectionName}...`);
    
    const result = {
      collection: operation.collectionName,
      documentsFound: 0,
      description: operation.description,
      priority: operation.priority
    };

    try {
      let snapshot;
      
      if (operation.condition) {
        const query = db.collection(operation.collectionName)
          .where(operation.condition.field, operation.condition.operator, operation.condition.value);
        snapshot = await query.get();
      } else {
        snapshot = await db.collection(operation.collectionName).get();
      }

      result.documentsFound = snapshot.size;
      report.totalDocumentsFound += snapshot.size;
      
      console.log(`  📋 ${operation.collectionName}: ${snapshot.size} documentos seriam deletados`);
      
    } catch (error) {
      console.warn(`  ⚠️ Erro ao acessar ${operation.collectionName}:`, error.message);
      result.error = error.message;
    }

    report.results.push(result);
    report.totalCollections++;
  }

  report.executionTime = Date.now() - startTime;

  console.log('\n📊 Relatório do DRY RUN:');
  console.table({
    'Coleções analisadas': report.totalCollections,
    'Documentos encontrados': report.totalDocumentsFound,
    'Tempo de execução': `${(report.executionTime / 1000).toFixed(2)}s`
  });

  return report;
}

// Função para executar reset real
async function executeRealReset() {
  console.log('🚨 EXECUTANDO RESET REAL - DADOS SERÃO DELETADOS!');
  
  // Confirmação de segurança
  const confirmed = confirm('⚠️ ATENÇÃO: Esta operação irá DELETAR PERMANENTEMENTE todos os dados dos estudantes!\n\nDigite "CONFIRMO" na próxima caixa para continuar:');
  
  if (!confirmed) {
    console.log('❌ Operação cancelada pelo usuário');
    return false;
  }

  const confirmText = prompt('Digite "CONFIRMO" para prosseguir:');
  if (confirmText !== 'CONFIRMO') {
    console.log('❌ Confirmação incorreta. Operação cancelada.');
    return false;
  }

  const report = {
    timestamp: new Date(),
    totalCollections: 0,
    totalDocumentsDeleted: 0,
    totalErrors: 0,
    results: [],
    executionTime: 0
  };

  const startTime = Date.now();

  for (const operation of RESET_OPERATIONS) {
    console.log(`🗑️ Deletando ${operation.collectionName}...`);
    
    const result = {
      collection: operation.collectionName,
      documentsFound: 0,
      documentsDeleted: 0,
      errors: []
    };

    try {
      let snapshot;
      
      if (operation.condition) {
        const query = db.collection(operation.collectionName)
          .where(operation.condition.field, operation.condition.operator, operation.condition.value);
        snapshot = await query.get();
      } else {
        snapshot = await db.collection(operation.collectionName).get();
      }

      result.documentsFound = snapshot.size;

      // Deletar em lotes
      const batch = db.batch();
      let batchCount = 0;
      
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        batchCount++;
        
        if (batchCount >= RESET_CONFIG.batchSize) {
          await batch.commit();
          result.documentsDeleted += batchCount;
          console.log(`  💾 Batch commitado: ${result.documentsDeleted}/${result.documentsFound}`);
          batchCount = 0;
        }
      }

      // Commit último batch se houver documentos restantes
      if (batchCount > 0) {
        await batch.commit();
        result.documentsDeleted += batchCount;
      }

      console.log(`  ✅ ${operation.collectionName}: ${result.documentsDeleted} documentos deletados`);
      
    } catch (error) {
      console.error(`  ❌ Erro ao deletar ${operation.collectionName}:`, error.message);
      result.errors.push(error.message);
      report.totalErrors++;
    }

    report.results.push(result);
    report.totalCollections++;
    report.totalDocumentsDeleted += result.documentsDeleted;
  }

  report.executionTime = Date.now() - startTime;

  console.log('\n📊 Relatório Final do Reset:');
  console.table({
    'Coleções processadas': report.totalCollections,
    'Documentos deletados': report.totalDocumentsDeleted,
    'Erros': report.totalErrors,
    'Tempo de execução': `${(report.executionTime / 1000).toFixed(2)}s`
  });

  return report;
}

// Comandos disponíveis no console
window.StudentResetCommands = {
  // Verificar status
  async status() {
    return await getSystemStatus();
  },
  
  // Dry run
  async dryRun() {
    return await executeDryRun();
  },
  
  // Reset real (com confirmação)
  async reset() {
    return await executeRealReset();
  },

  // Executar sequência completa
  async fullSequence() {
    console.log('🔄 Executando sequência completa...\n');
    
    // 1. Verificar status
    const status = await getSystemStatus();
    if (status.systemHealth === 'critical') {
      console.error('🚨 SISTEMA CRÍTICO - NÃO EXECUTE RESET!');
      return false;
    }

    console.log('\n' + '='.repeat(50));
    
    // 2. Dry run
    const dryRunReport = await executeDryRun();
    
    // 3. Perguntar se deseja continuar
    const shouldContinue = confirm(`Dry run concluído!\n\nForam encontrados ${dryRunReport.totalDocumentsFound} documentos para deletar.\n\nDeseja executar o reset REAL?`);
    
    if (shouldContinue) {
      console.log('\n' + '='.repeat(50));
      return await executeRealReset();
    } else {
      console.log('✅ Operação finalizada no dry run.');
      return dryRunReport;
    }
  }
};

// Instruções de uso
console.log('🎮 Comandos disponíveis no console:');
console.log('  StudentResetCommands.status() - Verificar status do sistema');
console.log('  StudentResetCommands.dryRun() - Simular reset (seguro)');
console.log('  StudentResetCommands.reset() - Executar reset REAL (PERIGOSO!)');
console.log('  StudentResetCommands.fullSequence() - Sequência completa');
console.log('\n💡 Recomendação: Execute StudentResetCommands.fullSequence() para processo guiado');
console.log('⚠️ ATENÇÃO: O reset real irá DELETAR PERMANENTEMENTE todos os dados dos estudantes!');
