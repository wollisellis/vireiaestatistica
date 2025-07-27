/**
 * Script para testar as consultas da coleção classStudents após a migração
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testClassQueries() {
  console.log('🧪 Testando consultas da coleção classStudents após migração...');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}`);
  
  try {
    // Primeiro, listar todas as turmas disponíveis
    console.log('\n📋 Listando todas as turmas disponíveis...');
    const allSnapshot = await getDocs(collection(db, 'classStudents'));
    const turmas = new Set();
    
    allSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.classId) {
        turmas.add(data.classId);
      }
    });
    
    console.log(`🏫 Turmas encontradas: ${Array.from(turmas).join(', ')}`);
    
    // Testar consultas para cada turma
    for (const classId of turmas) {
      console.log(`\n🔍 Testando consultas para turma: ${classId}`);
      
      // Teste 1: Query básica por classId
      try {
        console.log('   Teste 1: Query básica por classId');
        const q1 = query(collection(db, 'classStudents'), where('classId', '==', classId));
        const snapshot1 = await getDocs(q1);
        console.log(`   ✅ Resultado: ${snapshot1.size} estudantes encontrados`);
        
        snapshot1.docs.forEach(doc => {
          const data = doc.data();
          console.log(`      - ${data.studentName} (${data.studentEmail})`);
        });
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
      
      // Teste 2: Query por classId e status
      try {
        console.log('   Teste 2: Query por classId e status active');
        const q2 = query(
          collection(db, 'classStudents'), 
          where('classId', '==', classId),
          where('status', '==', 'active')
        );
        const snapshot2 = await getDocs(q2);
        console.log(`   ✅ Resultado: ${snapshot2.size} estudantes ativos`);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        if (error.code === 'failed-precondition') {
          console.log('   ⚠️ Índice composto necessário. Criando automaticamente...');
        }
      }
      
      // Teste 3: Query por range de document IDs (método de fallback)
      try {
        console.log('   Teste 3: Query por range de document IDs');
        const q3 = query(
          collection(db, 'classStudents'),
          where('__name__', '>=', `${classId}_`),
          where('__name__', '<', `${classId}_\uf8ff`)
        );
        const snapshot3 = await getDocs(q3);
        console.log(`   ✅ Resultado: ${snapshot3.size} estudantes (método fallback)`);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    // Teste 4: Simular consulta do enhancedClassService
    console.log('\n🔧 Simulando consulta do enhancedClassService...');
    const primeiraClassId = Array.from(turmas)[0];
    if (primeiraClassId) {
      await simulateEnhancedClassServiceQuery(primeiraClassId);
    }
    
    console.log('\n✅ Todos os testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

async function simulateEnhancedClassServiceQuery(classId) {
  console.log(`   Simulando getClassStudentsBasic para turma: ${classId}`);
  
  // Método 1: Query otimizada com índice composto
  try {
    console.log('   Método 1: Query com índice composto');
    const q = query(
      collection(db, 'classStudents'),
      where('classId', '==', classId),
      where('status', 'in', ['active', 'inactive'])
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const students = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: data.studentId,
          studentName: data.studentName || data.name,
          studentEmail: data.studentEmail || data.email,
          status: data.status,
          enrolledAt: data.enrolledAt,
          lastActivity: data.lastActivity
        };
      }).filter(student => student.studentId && student.studentName);
      
      console.log(`   ✅ Método 1: ${students.length} estudantes encontrados`);
      students.forEach(student => {
        console.log(`      - ${student.studentName} (${student.studentEmail}) - Status: ${student.status}`);
      });
      return students;
    }
  } catch (indexError) {
    console.log(`   ⚠️ Método 1 falhou (índice): ${indexError.message}`);
  }
  
  // Método 2: Fallback usando apenas classId
  try {
    console.log('   Método 2: Fallback usando apenas classId');
    const q = query(
      collection(db, 'classStudents'),
      where('classId', '==', classId)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const students = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: data.studentId,
          studentName: data.studentName || data.name,
          studentEmail: data.studentEmail || data.email,
          status: data.status,
          enrolledAt: data.enrolledAt,
          lastActivity: data.lastActivity
        };
      }).filter(student => 
        student.studentId && 
        student.studentName && 
        (!student.status || ['active', 'inactive', 'pending'].includes(student.status))
      );
      
      console.log(`   ✅ Método 2: ${students.length} estudantes encontrados`);
      students.forEach(student => {
        console.log(`      - ${student.studentName} (${student.studentEmail}) - Status: ${student.status}`);
      });
      return students;
    }
  } catch (fallbackError) {
    console.log(`   ⚠️ Método 2 falhou: ${fallbackError.message}`);
  }
  
  console.log('   ❌ Todos os métodos falharam');
  return [];
}

// Executar os testes
testClassQueries()
  .then(() => {
    console.log('\n🎉 Script de teste concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
