// Script para executar o reset de dados dos estudantes
// Baseado no studentDataResetScript.ts

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  writeBatch,
  doc,
  serverTimestamp 
} = require('firebase/firestore');

// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: '.env.local' });

// Configuração do Firebase (usando variáveis de ambiente)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING'
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    const professorsQuery = query(collection(db, 'users'), where('role', '==', 'professor'));
    const professorsSnapshot = await getDocs(professorsQuery);
    status.professors = professorsSnapshot.size;

    // Contar estudantes
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);
    status.students = studentsSnapshot.size;

    // Contar turmas
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    status.classes = classesSnapshot.size;

    // Contar dados de estudantes em outras coleções
    for (const operation of RESET_OPERATIONS) {
      if (operation.collectionName === 'users') continue;
      
      try {
        const snapshot = await getDocs(collection(db, operation.collectionName));
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
        const q = query(
          collection(db, operation.collectionName),
          where(operation.condition.field, operation.condition.operator, operation.condition.value)
        );
        snapshot = await getDocs(q);
      } else {
        snapshot = await getDocs(collection(db, operation.collectionName));
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
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const confirmed = await new Promise((resolve) => {
    rl.question('⚠️ ATENÇÃO: Esta operação irá DELETAR PERMANENTEMENTE todos os dados dos estudantes!\nDigite "CONFIRMO" para continuar: ', (answer) => {
      rl.close();
      resolve(answer === 'CONFIRMO');
    });
  });

  if (!confirmed) {
    console.log('❌ Operação cancelada pelo usuário');
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
        const q = query(
          collection(db, operation.collectionName),
          where(operation.condition.field, operation.condition.operator, operation.condition.value)
        );
        snapshot = await getDocs(q);
      } else {
        snapshot = await getDocs(collection(db, operation.collectionName));
      }

      result.documentsFound = snapshot.size;

      // Deletar em lotes
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        batch.delete(docSnapshot.ref);
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

// Função principal
async function main() {
  console.log('🚀 Student Data Reset Script - Bioestat Platform');
  console.log('================================================\n');

  try {
    // 1. Verificar status do sistema
    const status = await getSystemStatus();
    
    if (status.systemHealth === 'critical') {
      console.error('🚨 SISTEMA CRÍTICO - NÃO EXECUTE RESET!');
      process.exit(1);
    }

    // 2. Executar dry run
    console.log('\n' + '='.repeat(50));
    const dryRunReport = await executeDryRun();

    // 3. Perguntar se deseja executar reset real
    if (process.argv.includes('--execute')) {
      console.log('\n' + '='.repeat(50));
      await executeRealReset();
    } else {
      console.log('\n💡 Para executar o reset real, use: node run-student-reset.js --execute');
      console.log('⚠️ ATENÇÃO: O reset real irá DELETAR PERMANENTEMENTE os dados!');
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = {
  getSystemStatus,
  executeDryRun,
  executeRealReset
};
