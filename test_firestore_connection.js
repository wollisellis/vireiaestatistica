/**
 * Script simples para testar conexão com Firestore e listar estudantes
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:564836c9876cf33d2a9436"
};

// Inicializar Firebase
console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log(`✅ Conectado ao projeto: ${firebaseConfig.projectId}`);

async function listStudents() {
  try {
    console.log('\n🔍 Buscando usuários na coleção "users"...');
    
    // Buscar todos os usuários
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`📊 Total de documentos encontrados: ${usersSnapshot.size}`);
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado na coleção "users"');
      return;
    }
    
    const students = [];
    const professors = [];
    const others = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const userId = doc.id;
      
      const userInfo = {
        id: userId,
        email: data.email || 'N/A',
        fullName: data.fullName || 'N/A',
        role: data.role || 'N/A',
        anonymousId: data.anonymousId || 'N/A',
        institutionId: data.institutionId || 'N/A',
        totalScore: data.totalScore || 0,
        levelReached: data.levelReached || 1,
        gamesCompleted: data.gamesCompleted || 0,
        createdAt: data.createdAt || 'N/A',
        updatedAt: data.updatedAt || 'N/A',
        authProvider: data.authProvider || 'N/A'
      };
      
      if (data.role === 'student') {
        students.push(userInfo);
      } else if (data.role === 'professor') {
        professors.push(userInfo);
      } else {
        others.push(userInfo);
      }
    });
    
    // Exibir resultados
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO GERAL');
    console.log('='.repeat(80));
    console.log(`👨‍🎓 Total de Estudantes: ${students.length}`);
    console.log(`👨‍🏫 Total de Professores: ${professors.length}`);
    console.log(`❓ Outros usuários: ${others.length}`);
    console.log(`📈 Total geral: ${students.length + professors.length + others.length}`);
    
    if (students.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('👨‍🎓 ESTUDANTES REGISTRADOS');
      console.log('='.repeat(80));
      
      students.forEach((student, index) => {
        console.log(`\n📝 Estudante #${index + 1}`);
        console.log(`   🆔 ID: ${student.id}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   👤 Nome: ${student.fullName}`);
        console.log(`   🎭 ID Anônimo: ${student.anonymousId}`);
        console.log(`   🏫 Instituição: ${student.institutionId}`);
        console.log(`   🎯 Pontuação Total: ${student.totalScore}`);
        console.log(`   📊 Nível Alcançado: ${student.levelReached}`);
        console.log(`   🎮 Jogos Completados: ${student.gamesCompleted}`);
        console.log(`   🔐 Provedor Auth: ${student.authProvider}`);
        console.log(`   📅 Criado em: ${student.createdAt}`);
        console.log(`   🔄 Atualizado em: ${student.updatedAt}`);
      });
    } else {
      console.log('\n❌ Nenhum estudante encontrado na base de dados');
    }
    
    if (professors.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('👨‍🏫 PROFESSORES REGISTRADOS');
      console.log('='.repeat(80));
      
      professors.forEach((prof, index) => {
        console.log(`\n📝 Professor #${index + 1}`);
        console.log(`   🆔 ID: ${prof.id}`);
        console.log(`   📧 Email: ${prof.email}`);
        console.log(`   👤 Nome: ${prof.fullName}`);
        console.log(`   🏫 Instituição: ${prof.institutionId}`);
        console.log(`   🔐 Provedor Auth: ${prof.authProvider}`);
        console.log(`   📅 Criado em: ${prof.createdAt}`);
      });
    }
    
    // Verificar outras coleções
    console.log('\n' + '='.repeat(80));
    console.log('📚 VERIFICANDO OUTRAS COLEÇÕES');
    console.log('='.repeat(80));
    
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      console.log(`🏫 Turmas encontradas: ${classesSnapshot.size}`);
      
      classesSnapshot.forEach(doc => {
        const classData = doc.data();
        const studentsInClass = classData.students || [];
        const className = classData.name || 'N/A';
        console.log(`   📚 Turma '${className}': ${studentsInClass.length} estudantes`);
      });
    } catch (error) {
      console.log(`⚠️ Erro ao verificar turmas: ${error.message}`);
    }
    
    try {
      const progressSnapshot = await getDocs(collection(db, 'gameProgress'));
      console.log(`🎮 Registros de progresso: ${progressSnapshot.size}`);
    } catch (error) {
      console.log(`⚠️ Erro ao verificar progresso: ${error.message}`);
    }
    
    console.log('\n✅ Consulta concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
    console.error('🔍 Detalhes:', error.message);
  }
}

// Executar o script
console.log('🚀 Script para listar estudantes do Bioestat Platform');
console.log('📍 Projeto: vireiestatistica-ba7c5');
console.log('-'.repeat(50));

listStudents()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
