/**
 * Script para verificar dados reais dos estudantes usando Firebase CLI
 * Executa comandos do Firebase CLI para buscar dados
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runFirebaseCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executando: ${command}`);
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️ Warning: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

async function checkStudentData() {
  console.log('🔍 VERIFICANDO DADOS REAIS DOS ESTUDANTES');
  console.log('==========================================\n');

  try {
    // 1. Verificar estudantes matriculados
    console.log('👥 1. Verificando estudantes matriculados...');
    try {
      const classStudentsResult = await runFirebaseCommand(
        'firebase firestore:get classStudents --project vireiestatistica-ba7c5 --limit 10'
      );
      console.log('✅ Dados de classStudents encontrados');
      
      // Contar estudantes aceitos
      const lines = classStudentsResult.split('\n');
      const acceptedStudents = lines.filter(line => line.includes('"status": "accepted"'));
      console.log(`   📊 Estudantes aceitos encontrados: ${acceptedStudents.length}`);
      
    } catch (error) {
      console.log('❌ Erro ao buscar classStudents:', error.message);
    }

    // 2. Verificar progresso de jogos
    console.log('\n🎮 2. Verificando progresso de jogos...');
    try {
      const gameProgressResult = await runFirebaseCommand(
        'firebase firestore:get gameProgress --project vireiestatistica-ba7c5 --limit 10'
      );
      console.log('✅ Dados de gameProgress encontrados');
      
      // Contar jogos completados
      const lines = gameProgressResult.split('\n');
      const completedGames = lines.filter(line => line.includes('"completed": true'));
      console.log(`   📊 Jogos completados encontrados: ${completedGames.length}`);
      
    } catch (error) {
      console.log('❌ Erro ao buscar gameProgress:', error.message);
    }

    // 3. Verificar progresso de módulos
    console.log('\n📚 3. Verificando progresso de módulos...');
    try {
      const moduleProgressResult = await runFirebaseCommand(
        'firebase firestore:get student_module_progress --project vireiestatistica-ba7c5 --limit 10'
      );
      console.log('✅ Dados de student_module_progress encontrados');
      
      // Contar módulos completados
      const lines = moduleProgressResult.split('\n');
      const completedModules = lines.filter(line => line.includes('"isCompleted": true'));
      console.log(`   📊 Módulos completados encontrados: ${completedModules.length}`);
      
    } catch (error) {
      console.log('❌ Erro ao buscar student_module_progress:', error.message);
    }

    // 4. Verificar coleção unified_scores atual
    console.log('\n🏆 4. Verificando unified_scores atual...');
    try {
      const unifiedScoresResult = await runFirebaseCommand(
        'firebase firestore:get unified_scores --project vireiestatistica-ba7c5 --limit 10'
      );
      console.log('✅ Dados de unified_scores encontrados');
      
      // Contar registros
      const lines = unifiedScoresResult.split('\n');
      const scoreEntries = lines.filter(line => line.includes('"totalScore"'));
      console.log(`   📊 Registros de pontuação encontrados: ${scoreEntries.length}`);
      
    } catch (error) {
      console.log('❌ Erro ao buscar unified_scores:', error.message);
    }

    // 5. Verificar usuários
    console.log('\n👤 5. Verificando usuários...');
    try {
      const usersResult = await runFirebaseCommand(
        'firebase firestore:get users --project vireiestatistica-ba7c5 --limit 10'
      );
      console.log('✅ Dados de users encontrados');
      
      // Contar estudantes
      const lines = usersResult.split('\n');
      const students = lines.filter(line => line.includes('"role": "student"'));
      console.log(`   📊 Usuários estudantes encontrados: ${students.length}`);
      
    } catch (error) {
      console.log('❌ Erro ao buscar users:', error.message);
    }

    console.log('\n📋 RESUMO DA VERIFICAÇÃO:');
    console.log('========================');
    console.log('✅ Verificação concluída');
    console.log('📊 Use os dados acima para entender o estado atual do banco');
    console.log('🎯 Se há estudantes aceitos E jogos/módulos completados, o ranking pode ser gerado');

  } catch (error) {
    console.error('❌ Erro geral na verificação:', error);
  }
}

// Função alternativa para listar coleções
async function listCollections() {
  console.log('\n🗂️ LISTANDO COLEÇÕES DISPONÍVEIS');
  console.log('=================================\n');

  try {
    const result = await runFirebaseCommand(
      'firebase firestore:indexes --project vireiestatistica-ba7c5'
    );
    console.log('Informações sobre índices:', result);
  } catch (error) {
    console.log('❌ Erro ao listar índices:', error.message);
  }
}

// Função para verificar regras do Firestore
async function checkFirestoreRules() {
  console.log('\n🔒 VERIFICANDO REGRAS DO FIRESTORE');
  console.log('==================================\n');

  try {
    const rulesContent = fs.readFileSync('firestore.rules', 'utf8');
    console.log('✅ Regras do Firestore carregadas');
    
    // Verificar se há regras permissivas para unified_scores
    if (rulesContent.includes('unified_scores')) {
      console.log('✅ Regras para unified_scores encontradas');
      
      if (rulesContent.includes('allow read: if isAuthenticated()')) {
        console.log('✅ Regras permitem leitura para usuários autenticados');
      } else {
        console.log('⚠️ Regras podem estar muito restritivas');
      }
    } else {
      console.log('❌ Nenhuma regra específica para unified_scores encontrada');
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar regras:', error.message);
  }
}

// Executar verificações
async function main() {
  await checkStudentData();
  await listCollections();
  await checkFirestoreRules();
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('==================');
  console.log('1. Se há dados de estudantes e atividades completadas:');
  console.log('   - O ranking pode ser gerado com dados reais');
  console.log('   - Use a função generateRealRankingData() no frontend');
  console.log('');
  console.log('2. Se não há dados suficientes:');
  console.log('   - Verifique se estudantes completaram jogos/módulos');
  console.log('   - Considere popular dados de teste');
  console.log('');
  console.log('3. Se há problemas de permissão:');
  console.log('   - Verifique as regras do Firestore');
  console.log('   - Considere usar autenticação adequada');
}

main().then(() => {
  console.log('\n✅ Verificação completa');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro na verificação:', error);
  process.exit(1);
});
