/**
 * Script para atualizar todos os contadores de estudantes no banco de dados
 * Isso vai corrigir o problema da lista de turmas mostrando contadores incorretos
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where, writeBatch } = require('firebase/firestore');

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

async function updateAllStudentCounts() {
  console.log('🔄 ATUALIZANDO CONTADORES DE ESTUDANTES NO BANCO');
  console.log('===============================================');
  
  try {
    // Buscar todas as turmas
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`📊 Encontradas ${classesSnapshot.size} turmas para atualizar`);
    
    const batch = writeBatch(db);
    let updatesCount = 0;
    
    for (const classDoc of classesSnapshot.docs) {
      const classId = classDoc.id;
      const classData = classDoc.data();
      
      console.log(`\n🔍 Processando turma: ${classData.name} (${classId})`);
      
      // Contar estudantes reais em ambas as coleções
      const classStudentsSnapshot = await getDocs(
        query(collection(db, 'classStudents'), where('classId', '==', classId))
      );
      
      const altClassStudentsSnapshot = await getDocs(
        query(collection(db, 'class_students'), where('classId', '==', classId))
      );
      
      const realStudentCount1 = classStudentsSnapshot.size;
      const realStudentCount2 = altClassStudentsSnapshot.size;
      const actualStudentCount = Math.max(realStudentCount1, realStudentCount2);
      const storedStudentCount = classData.studentsCount || 0;
      
      console.log(`   Contador atual no banco: ${storedStudentCount}`);
      console.log(`   Estudantes em 'classStudents': ${realStudentCount1}`);
      console.log(`   Estudantes em 'class_students': ${realStudentCount2}`);
      console.log(`   Contador real calculado: ${actualStudentCount}`);
      
      if (storedStudentCount !== actualStudentCount) {
        console.log(`   🔧 ATUALIZANDO: ${storedStudentCount} → ${actualStudentCount}`);
        
        const classRef = doc(db, 'classes', classId);
        batch.update(classRef, {
          studentsCount: actualStudentCount,
          studentsCountUpdatedAt: new Date(),
          updatedAt: new Date()
        });
        updatesCount++;
        
        // Listar estudantes encontrados para debug
        if (actualStudentCount > 0) {
          console.log(`   📋 Estudantes encontrados:`);
          
          // Listar da primeira coleção
          classStudentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`      - ${data.studentName || data.name || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
          });
          
          // Listar da segunda coleção se diferente
          if (realStudentCount2 > realStudentCount1) {
            altClassStudentsSnapshot.docs.forEach(doc => {
              const data = doc.data();
              console.log(`      - ALT: ${data.studentName || data.name || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
            });
          }
        }
      } else {
        console.log(`   ✅ Contador já está correto`);
      }
    }
    
    if (updatesCount > 0) {
      console.log(`\n💾 Aplicando ${updatesCount} atualizações no banco...`);
      await batch.commit();
      console.log('✅ Contadores atualizados no banco de dados!');
    } else {
      console.log('\n✅ Todos os contadores já estavam corretos');
    }
    
    // Verificação final
    console.log('\n🔍 VERIFICAÇÃO FINAL:');
    const updatedClassesSnapshot = await getDocs(collection(db, 'classes'));
    let totalStudentsInSystem = 0;
    
    for (const classDoc of updatedClassesSnapshot.docs) {
      const classData = classDoc.data();
      const studentsCount = classData.studentsCount || 0;
      
      if (studentsCount > 0) {
        totalStudentsInSystem += studentsCount;
        console.log(`   ${classData.name}: ${studentsCount} estudantes`);
      }
    }
    
    console.log(`📊 Total de estudantes no sistema: ${totalStudentsInSystem}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar contadores:', error);
  }
}

async function testClassListDisplay() {
  console.log('\n🧪 TESTANDO EXIBIÇÃO NA LISTA DE TURMAS');
  console.log('======================================');
  
  try {
    // Simular como o ClassManagement carrega os dados
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    console.log('📋 Como a lista de turmas deve aparecer agora:');
    classesSnapshot.docs.forEach(doc => {
      const classData = doc.data();
      if (classData.studentsCount > 0) {
        console.log(`   📚 ${classData.name}: ${classData.studentsCount} estudante(s)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar atualizações
updateAllStudentCounts()
  .then(() => testClassListDisplay())
  .then(() => {
    console.log('\n🎉 ATUALIZAÇÃO DE CONTADORES COMPLETA!');
    console.log('=====================================');
    console.log('✅ Todos os contadores foram atualizados no banco');
    console.log('✅ A lista de turmas deve mostrar valores corretos agora');
    console.log('✅ Recarregue a página para ver as mudanças');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
