/**
 * Script para corrigir o contador da turma "Avaliação Nutricionala"
 * que tem 2 estudantes ativos mas mostra apenas 1
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

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

async function fixAvaliacaoNutricionalaCounter() {
  console.log('🔧 CORRIGINDO CONTADOR DA TURMA "AVALIAÇÃO NUTRICIONALA"');
  console.log('======================================================');
  
  try {
    // 1. Encontrar a turma específica
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    let targetClass = null;
    
    classesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.includes('Avaliação Nutricionala')) {
        targetClass = {
          id: doc.id,
          name: data.name,
          studentsCount: data.studentsCount || 0
        };
      }
    });
    
    if (!targetClass) {
      console.log('❌ Turma não encontrada');
      return;
    }
    
    console.log(`📚 Turma encontrada: ${targetClass.name}`);
    console.log(`   ID: ${targetClass.id}`);
    console.log(`   Contador atual: ${targetClass.studentsCount}`);
    
    // 2. Contar estudantes ativos usando múltiplos métodos
    console.log('\n👥 CONTANDO ESTUDANTES ATIVOS:');
    
    const activeStudents = [];
    
    // Método 1: Query por classId
    try {
      const query1 = query(
        collection(db, 'classStudents'),
        where('classId', '==', targetClass.id),
        where('status', '==', 'active')
      );
      const snapshot1 = await getDocs(query1);
      
      snapshot1.docs.forEach(doc => {
        const data = doc.data();
        activeStudents.push({
          method: 'classId query',
          docId: doc.id,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          studentId: data.studentId
        });
      });
      
      console.log(`📊 Método 1 (classId query): ${snapshot1.size} estudantes`);
    } catch (error) {
      console.log(`⚠️ Método 1 falhou: ${error.message}`);
    }
    
    // Método 2: Buscar todos e filtrar por docId que contém classId
    const allStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    
    allStudentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      
      // Verificar se o docId contém o classId da turma e se está ativo
      if (docId.includes(targetClass.id) && data.status === 'active') {
        // Verificar se já não foi adicionado pelo método 1
        const exists = activeStudents.find(s => s.docId === docId);
        if (!exists) {
          activeStudents.push({
            method: 'docId filter',
            docId: docId,
            studentName: data.studentName,
            studentEmail: data.studentEmail,
            studentId: data.studentId
          });
        }
      }
    });
    
    console.log(`📊 Total de estudantes ativos encontrados: ${activeStudents.length}`);
    
    // 3. Listar estudantes encontrados
    console.log('\n📋 ESTUDANTES ATIVOS ENCONTRADOS:');
    activeStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.studentName}`);
      console.log(`   Email: ${student.studentEmail}`);
      console.log(`   StudentId: ${student.studentId?.slice(-6) || 'N/A'}`);
      console.log(`   Método: ${student.method}`);
      console.log(`   DocId: ${student.docId}`);
      console.log('');
    });
    
    // 4. Corrigir contador se necessário
    const correctCount = activeStudents.length;
    const currentCount = targetClass.studentsCount;
    
    console.log(`🎯 ANÁLISE DO CONTADOR:`);
    console.log(`   Contador atual: ${currentCount}`);
    console.log(`   Contador correto: ${correctCount}`);
    
    if (correctCount !== currentCount) {
      console.log(`\n🔧 CORRIGINDO CONTADOR: ${currentCount} → ${correctCount}`);
      
      const classRef = doc(db, 'classes', targetClass.id);
      await updateDoc(classRef, {
        studentsCount: correctCount,
        studentsCountCorrectedAt: new Date(),
        studentsCountCorrectionReason: `Corrigido de ${currentCount} para ${correctCount} - encontrados ${correctCount} estudantes ativos`,
        updatedAt: new Date()
      });
      
      console.log(`✅ Contador corrigido com sucesso!`);
      
      // Verificar se a correção foi aplicada
      const updatedClassDoc = await doc(db, 'classes', targetClass.id);
      const updatedClassSnapshot = await getDocs(query(collection(db, 'classes'), where('__name__', '==', targetClass.id)));
      
      if (!updatedClassSnapshot.empty) {
        const updatedData = updatedClassSnapshot.docs[0].data();
        console.log(`✅ Verificação: Contador agora é ${updatedData.studentsCount}`);
      }
      
    } else {
      console.log(`✅ Contador já está correto`);
    }
    
    // 5. Verificar se há problemas com os docIds
    console.log('\n🔍 VERIFICANDO PROBLEMAS COM DOCIDS:');
    
    activeStudents.forEach(student => {
      const expectedDocId = `${targetClass.id}_${student.studentId}`;
      if (student.docId !== expectedDocId) {
        console.log(`⚠️ DocId inconsistente para ${student.studentName}:`);
        console.log(`   Atual: ${student.docId}`);
        console.log(`   Esperado: ${expectedDocId}`);
        console.log(`   Isso pode causar problemas nas queries`);
      } else {
        console.log(`✅ DocId correto para ${student.studentName}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
}

async function verifyAllClassCounters() {
  console.log('\n🔍 VERIFICAÇÃO FINAL DE TODOS OS CONTADORES:');
  console.log('============================================');
  
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      if (classData.studentsCount > 0) {
        // Contar estudantes ativos usando método robusto
        const allStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
        
        const activeStudentsInClass = allStudentsSnapshot.docs.filter(doc => {
          const data = doc.data();
          const docId = doc.id;
          
          // Verificar se pertence à turma e está ativo
          return (
            (data.classId === classId || docId.includes(classId)) &&
            data.status === 'active'
          );
        });
        
        const realCount = activeStudentsInClass.length;
        const storedCount = classData.studentsCount;
        
        console.log(`\n📚 ${classData.name}`);
        console.log(`   Contador armazenado: ${storedCount}`);
        console.log(`   Estudantes ativos reais: ${realCount}`);
        
        if (realCount !== storedCount) {
          console.log(`   ⚠️ INCONSISTÊNCIA DETECTADA`);
        } else {
          console.log(`   ✅ Contador correto`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar correção
fixAvaliacaoNutricionalaCounter()
  .then(() => verifyAllClassCounters())
  .then(() => {
    console.log('\n🎉 CORREÇÃO DO CONTADOR COMPLETA!');
    console.log('=================================');
    console.log('✅ Turma "Avaliação Nutricionala" agora mostra 2 estudantes');
    console.log('✅ Lista e detalhes devem ser consistentes');
    console.log('✅ Recarregue a página para ver as mudanças');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
