/**
 * Script de debug para verificar os dados da coleção classStudents
 * Usa as configurações do Firebase do projeto
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function debugClassStudents() {
  console.log('🔍 Iniciando debug da coleção classStudents...');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}`);
  
  try {
    // Buscar todos os documentos da coleção classStudents
    console.log('📡 Buscando documentos da coleção classStudents...');
    const snapshot = await getDocs(collection(db, 'classStudents'));
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('❌ Nenhum documento encontrado na coleção classStudents');
      return;
    }
    
    // Agrupar por turma
    const classesByTurma = {};
    const allStudents = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      
      console.log(`\n📄 Documento: ${docId}`);
      console.log('   Dados:', JSON.stringify(data, null, 2));
      
      // Extrair classId do documento ID (formato: classId_studentId)
      const classId = data.classId || docId.split('_')[0];
      
      if (!classesByTurma[classId]) {
        classesByTurma[classId] = [];
      }
      
      classesByTurma[classId].push({
        docId,
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        status: data.status,
        classId: data.classId,
        registeredAt: data.registeredAt,
        enrolledAt: data.enrolledAt
      });
      
      allStudents.push({
        docId,
        classId,
        ...data
      });
    });
    
    console.log('\n📋 Resumo por turma:');
    Object.keys(classesByTurma).forEach(classId => {
      const students = classesByTurma[classId];
      console.log(`\n🏫 Turma: ${classId}`);
      console.log(`   👥 Estudantes: ${students.length}`);
      
      students.forEach(student => {
        console.log(`   - ${student.studentName} (${student.studentEmail})`);
        console.log(`     Status: ${student.status || 'undefined'}`);
        console.log(`     ClassId no doc: ${student.classId || 'undefined'}`);
        console.log(`     Doc ID: ${student.docId}`);
      });
    });
    
    // Verificar problemas comuns
    console.log('\n🔍 Verificando problemas comuns:');
    
    const semClassId = allStudents.filter(s => !s.classId);
    if (semClassId.length > 0) {
      console.log(`⚠️ ${semClassId.length} documentos sem campo classId:`);
      semClassId.forEach(s => console.log(`   - ${s.docId}`));
    } else {
      console.log('✅ Todos os documentos têm campo classId');
    }
    
    const semStatus = allStudents.filter(s => !s.status);
    if (semStatus.length > 0) {
      console.log(`⚠️ ${semStatus.length} documentos sem campo status:`);
      semStatus.forEach(s => console.log(`   - ${s.docId}`));
    } else {
      console.log('✅ Todos os documentos têm campo status');
    }
    
    const statusInvalido = allStudents.filter(s => s.status && !['active', 'inactive', 'pending', 'removed'].includes(s.status));
    if (statusInvalido.length > 0) {
      console.log(`⚠️ ${statusInvalido.length} documentos com status inválido:`);
      statusInvalido.forEach(s => console.log(`   - ${s.docId}: ${s.status}`));
    } else {
      console.log('✅ Todos os status são válidos');
    }
    
    console.log('\n✅ Debug concluído!');
    
    // Testar consultas específicas se houver turmas
    const turmas = Object.keys(classesByTurma);
    if (turmas.length > 0) {
      console.log('\n🧪 Testando consultas para a primeira turma...');
      await testClassQuery(turmas[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
}

// Função para testar consultas específicas
async function testClassQuery(classId) {
  console.log(`\n🔍 Testando consultas para turma: ${classId}`);
  
  try {
    // Teste 1: Query por classId
    console.log('Teste 1: Query por classId');
    const q1 = query(collection(db, 'classStudents'), where('classId', '==', classId));
    const snapshot1 = await getDocs(q1);
    console.log(`   Resultado: ${snapshot1.size} documentos`);
    
    // Teste 2: Query por classId e status
    console.log('Teste 2: Query por classId e status active');
    const q2 = query(
      collection(db, 'classStudents'), 
      where('classId', '==', classId),
      where('status', '==', 'active')
    );
    const snapshot2 = await getDocs(q2);
    console.log(`   Resultado: ${snapshot2.size} documentos`);
    
    // Teste 3: Query por status múltiplos
    console.log('Teste 3: Query por status múltiplos (active, inactive)');
    const q3 = query(
      collection(db, 'classStudents'),
      where('classId', '==', classId),
      where('status', 'in', ['active', 'inactive'])
    );
    const snapshot3 = await getDocs(q3);
    console.log(`   Resultado: ${snapshot3.size} documentos`);
    
  } catch (error) {
    console.error('❌ Erro nos testes de consulta:', error);
    
    if (error.code === 'failed-precondition') {
      console.log('⚠️ Erro de índice. Pode ser necessário criar índices compostos no Firebase Console.');
      console.log('🔗 Acesse: https://console.firebase.google.com/project/vireiestatistica-ba7c5/firestore/indexes');
    }
  }
}

// Executar o debug
debugClassStudents()
  .then(() => {
    console.log('\n🎉 Script concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
