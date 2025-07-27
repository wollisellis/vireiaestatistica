/**
 * Script para listar estudantes usando Firebase Admin SDK
 * Mostra informações detalhadas dos estudantes cadastrados
 */

const admin = require('firebase-admin');
const path = require('path');

// Tentar diferentes métodos de autenticação
function initializeFirebaseAdmin() {
  try {
    // Método 1: Tentar usar credenciais do arquivo de serviço se existir
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'vireiestatistica-ba7c5'
      });
      console.log('✅ Firebase Admin inicializado com service account');
      return true;
    } catch (serviceAccountError) {
      console.log('⚠️ Service account não encontrado, tentando credenciais padrão...');
    }

    // Método 2: Usar credenciais padrão do ambiente
    admin.initializeApp({
      projectId: 'vireiestatistica-ba7c5'
    });
    console.log('✅ Firebase Admin inicializado com credenciais padrão');
    return true;

  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
    console.log('1. Execute: firebase login');
    console.log('2. Execute: gcloud auth application-default login');
    console.log('3. Defina GOOGLE_APPLICATION_CREDENTIALS para um arquivo de service account');
    console.log('4. Execute o script em um ambiente com credenciais configuradas');
    return false;
  }
}

if (!initializeFirebaseAdmin()) {
  process.exit(1);
}

const db = admin.firestore();

async function listStudents() {
  console.log('👥 LISTANDO ESTUDANTES NO FIREBASE');
  console.log('==================================\n');

  try {
    // 1. Buscar usuários com role 'student'
    console.log('🔍 1. Buscando usuários estudantes...');
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ Nenhum estudante encontrado na coleção users');
    } else {
      console.log(`✅ Encontrados ${usersSnapshot.size} estudantes na coleção users\n`);
      
      console.log('📋 LISTA DE ESTUDANTES:');
      console.log('======================');
      
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. ID: ${doc.id}`);
        console.log(`   📧 Email: ${data.email || 'N/A'}`);
        console.log(`   👤 Nome: ${data.fullName || data.name || 'N/A'}`);
        console.log(`   🏫 Instituição: ${data.institutionId || 'N/A'}`);
        console.log(`   🎯 Pontuação Total: ${data.totalScore || 0}`);
        console.log(`   📊 Nível: ${data.levelReached || 1}`);
        console.log(`   🎮 Jogos Completados: ${data.gamesCompleted || 0}`);
        console.log(`   🆔 ID Anônimo: ${data.anonymousId || 'N/A'}`);
        console.log(`   📅 Criado em: ${data.createdAt || 'N/A'}`);
        console.log(`   🔧 Setup: ${data.setupBy || 'Manual'}`);
        if (data.authProvider) {
          console.log(`   🔐 Provedor Auth: ${data.authProvider}`);
        }
      });
    }

    // 2. Buscar estudantes matriculados em turmas
    console.log('\n\n🏫 2. Buscando estudantes matriculados em turmas...');
    const classStudentsSnapshot = await db.collection('classStudents').get();

    if (classStudentsSnapshot.empty) {
      console.log('❌ Nenhum estudante encontrado na coleção classStudents');
    } else {
      console.log(`✅ Encontrados ${classStudentsSnapshot.size} registros na coleção classStudents\n`);
      
      // Agrupar por turma
      const classesByClass = {};
      classStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const classId = data.classId || 'Sem turma';
        
        if (!classesByClass[classId]) {
          classesByClass[classId] = [];
        }
        
        classesByClass[classId].push({
          id: doc.id,
          ...data
        });
      });

      console.log('📚 ESTUDANTES POR TURMA:');
      console.log('========================');
      
      Object.keys(classesByClass).forEach((classId) => {
        const students = classesByClass[classId];
        console.log(`\n🏫 Turma: ${classId}`);
        console.log(`   👥 Total de estudantes: ${students.length}`);
        
        students.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.studentName || 'Nome não informado'}`);
          console.log(`      📧 Email: ${student.email || 'N/A'}`);
          console.log(`      🆔 Student ID: ${student.studentId || 'N/A'}`);
          console.log(`      📊 Status: ${student.status || 'N/A'}`);
          console.log(`      ✅ Ativo: ${student.isActive !== false ? 'Sim' : 'Não'}`);
          if (student.enrolledAt) {
            console.log(`      📅 Matriculado em: ${student.enrolledAt.toDate ? student.enrolledAt.toDate().toLocaleDateString() : student.enrolledAt}`);
          }
        });
      });
    }

    // 3. Verificar progresso de jogos
    console.log('\n\n🎮 3. Verificando progresso de jogos...');
    const gameProgressSnapshot = await db.collection('gameProgress')
      .limit(10)
      .get();

    if (!gameProgressSnapshot.empty) {
      console.log(`✅ Encontrados ${gameProgressSnapshot.size} registros de progresso de jogos`);
      
      const studentsWithProgress = new Set();
      gameProgressSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentId) {
          studentsWithProgress.add(data.studentId);
        }
      });
      
      console.log(`   👥 Estudantes únicos com progresso: ${studentsWithProgress.size}`);
    } else {
      console.log('❌ Nenhum progresso de jogo encontrado');
    }

    // 4. Verificar progresso de módulos
    console.log('\n🔍 4. Verificando progresso de módulos...');
    const moduleProgressSnapshot = await db.collection('student_module_progress')
      .limit(10)
      .get();

    if (!moduleProgressSnapshot.empty) {
      console.log(`✅ Encontrados ${moduleProgressSnapshot.size} registros de progresso de módulos`);
      
      const studentsWithModuleProgress = new Set();
      moduleProgressSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentId) {
          studentsWithModuleProgress.add(data.studentId);
        }
      });
      
      console.log(`   👥 Estudantes únicos com progresso de módulos: ${studentsWithModuleProgress.size}`);
    } else {
      console.log('❌ Nenhum progresso de módulo encontrado');
    }

    // 5. Resumo final
    console.log('\n\n📊 RESUMO GERAL:');
    console.log('================');
    console.log(`👥 Total de usuários estudantes: ${usersSnapshot.size}`);
    console.log(`🏫 Total de matrículas em turmas: ${classStudentsSnapshot.size}`);
    
    // Verificar se há estudantes ativos
    const activeStudents = [];
    classStudentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false && data.status !== 'rejected') {
        activeStudents.push(data);
      }
    });
    
    console.log(`✅ Estudantes ativos em turmas: ${activeStudents.length}`);
    
    if (activeStudents.length > 0) {
      console.log('\n🎯 PRÓXIMOS PASSOS:');
      console.log('==================');
      console.log('✅ Há estudantes cadastrados e ativos');
      console.log('📊 Você pode gerar rankings e relatórios');
      console.log('🎮 Verifique se há atividades completadas para análises');
    } else {
      console.log('\n⚠️ ATENÇÃO:');
      console.log('===========');
      console.log('❌ Poucos ou nenhum estudante ativo encontrado');
      console.log('📝 Considere verificar o processo de matrícula');
      console.log('🔧 Verifique se os estudantes estão sendo aceitos nas turmas');
    }

  } catch (error) {
    console.error('❌ Erro ao listar estudantes:', error);
  }
}

// Executar o script
listStudents().then(() => {
  console.log('\n✅ Listagem completa');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro na execução:', error);
  process.exit(1);
});
