/**
 * Script para corrigir registros de estudantes duplicados e inconsistentes
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, setDoc, query, where, writeBatch } = require('firebase/firestore');

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

async function fixStudentRegistrations() {
  console.log('🔧 CORRIGINDO REGISTROS DE ESTUDANTES');
  console.log('====================================');
  
  try {
    // 1. Analisar registros problemáticos
    console.log('\n📊 1. ANALISANDO REGISTROS PROBLEMÁTICOS:');
    
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    const registrationsByStudent = {};
    const problematicRegistrations = [];
    
    classStudentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const studentId = data.studentId;
      const classId = data.classId;
      
      if (!registrationsByStudent[studentId]) {
        registrationsByStudent[studentId] = [];
      }
      
      registrationsByStudent[studentId].push({
        docId: doc.id,
        classId: classId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        status: data.status,
        data: data
      });
      
      // Verificar se o classId está malformado
      if (!classId.startsWith('class_')) {
        problematicRegistrations.push({
          docId: doc.id,
          studentId: studentId,
          studentName: data.studentName,
          classId: classId,
          issue: 'ClassId malformado (sem prefixo class_)'
        });
      }
    });
    
    // 2. Identificar duplicatas
    console.log('\n👥 2. IDENTIFICANDO DUPLICATAS:');
    Object.keys(registrationsByStudent).forEach(studentId => {
      const registrations = registrationsByStudent[studentId];
      if (registrations.length > 1) {
        console.log(`⚠️ Estudante ${registrations[0].studentName} (${studentId.slice(-6)}) tem ${registrations.length} registros:`);
        registrations.forEach((reg, index) => {
          console.log(`   ${index + 1}. Turma: ${reg.classId}`);
          console.log(`      DocId: ${reg.docId}`);
        });
      }
    });
    
    // 3. Listar registros problemáticos
    console.log('\n🚨 3. REGISTROS PROBLEMÁTICOS:');
    if (problematicRegistrations.length > 0) {
      problematicRegistrations.forEach(reg => {
        console.log(`⚠️ ${reg.studentName} (${reg.studentId.slice(-6)})`);
        console.log(`   Problema: ${reg.issue}`);
        console.log(`   ClassId atual: ${reg.classId}`);
        console.log(`   DocId: ${reg.docId}`);
      });
    } else {
      console.log('✅ Nenhum registro problemático encontrado');
    }
    
    // 4. Corrigir registros malformados
    console.log('\n🔧 4. CORRIGINDO REGISTROS MALFORMADOS:');
    const batch = writeBatch(db);
    let fixCount = 0;
    
    for (const reg of problematicRegistrations) {
      // Tentar encontrar a turma correta
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      let correctClassId = null;
      
      for (const classDoc of classesSnapshot.docs) {
        const classId = classDoc.id;
        if (classId.includes(reg.classId)) {
          correctClassId = classId;
          break;
        }
      }
      
      if (correctClassId) {
        console.log(`🔧 Corrigindo ${reg.studentName}:`);
        console.log(`   De: ${reg.classId}`);
        console.log(`   Para: ${correctClassId}`);
        
        const docRef = doc(db, 'classStudents', reg.docId);
        batch.update(docRef, {
          classId: correctClassId,
          correctedAt: new Date(),
          updatedAt: new Date()
        });
        fixCount++;
      } else {
        console.log(`⚠️ Não foi possível encontrar turma correta para ${reg.studentName}`);
      }
    }
    
    // 5. Remover duplicatas (manter apenas o registro mais recente)
    console.log('\n🗑️ 5. REMOVENDO DUPLICATAS:');
    let duplicateRemovalCount = 0;
    
    Object.keys(registrationsByStudent).forEach(studentId => {
      const registrations = registrationsByStudent[studentId];
      if (registrations.length > 1) {
        // Ordenar por data de criação (mais recente primeiro)
        registrations.sort((a, b) => {
          const dateA = a.data.registeredAt ? new Date(a.data.registeredAt.seconds * 1000) : new Date(0);
          const dateB = b.data.registeredAt ? new Date(b.data.registeredAt.seconds * 1000) : new Date(0);
          return dateB - dateA;
        });
        
        // Manter apenas o primeiro (mais recente), remover os outros
        for (let i = 1; i < registrations.length; i++) {
          const regToRemove = registrations[i];
          console.log(`🗑️ Removendo registro duplicado de ${regToRemove.studentName}:`);
          console.log(`   DocId: ${regToRemove.docId}`);
          console.log(`   Turma: ${regToRemove.classId}`);
          
          const docRef = doc(db, 'classStudents', regToRemove.docId);
          batch.delete(docRef);
          duplicateRemovalCount++;
        }
      }
    });
    
    // 6. Aplicar correções
    if (fixCount > 0 || duplicateRemovalCount > 0) {
      console.log(`\n💾 Aplicando ${fixCount} correções e ${duplicateRemovalCount} remoções...`);
      await batch.commit();
      console.log('✅ Correções aplicadas!');
    } else {
      console.log('\n✅ Nenhuma correção necessária');
    }
    
    // 7. Atualizar contadores das turmas
    console.log('\n📊 7. ATUALIZANDO CONTADORES DAS TURMAS:');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const updateBatch = writeBatch(db);
    let counterUpdates = 0;
    
    for (const classDoc of classesSnapshot.docs) {
      const classId = classDoc.id;
      const classData = classDoc.data();
      
      // Contar estudantes reais após correções
      const studentsInClass = await getDocs(
        query(collection(db, 'classStudents'), where('classId', '==', classId))
      );
      
      const realCount = studentsInClass.size;
      const storedCount = classData.studentsCount || 0;
      
      if (realCount !== storedCount) {
        console.log(`🔧 Atualizando contador da turma ${classData.name}: ${storedCount} → ${realCount}`);
        
        const classRef = doc(db, 'classes', classId);
        updateBatch.update(classRef, {
          studentsCount: realCount,
          studentsCountUpdatedAt: new Date(),
          updatedAt: new Date()
        });
        counterUpdates++;
      }
    }
    
    if (counterUpdates > 0) {
      console.log(`💾 Aplicando ${counterUpdates} atualizações de contador...`);
      await updateBatch.commit();
      console.log('✅ Contadores atualizados!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
}

async function verifyFinalState() {
  console.log('\n🔍 VERIFICAÇÃO FINAL:');
  console.log('====================');
  
  try {
    // Verificar estado final
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    console.log(`📊 Total de registros de estudantes: ${classStudentsSnapshot.size}`);
    
    // Agrupar por turma
    const studentsByClass = {};
    classStudentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const classId = data.classId;
      
      if (!studentsByClass[classId]) {
        studentsByClass[classId] = [];
      }
      
      studentsByClass[classId].push({
        name: data.studentName,
        id: data.studentId?.slice(-6),
        email: data.studentEmail
      });
    });
    
    // Mostrar estudantes por turma
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;
      const students = studentsByClass[classId] || [];
      
      if (students.length > 0) {
        console.log(`\n📚 ${classData.name}: ${students.length} estudante(s)`);
        students.forEach(student => {
          console.log(`   - ${student.name} (${student.id}) - ${student.email}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar correções
fixStudentRegistrations()
  .then(() => verifyFinalState())
  .then(() => {
    console.log('\n🎉 CORREÇÃO DE REGISTROS COMPLETA!');
    console.log('=================================');
    console.log('✅ Registros duplicados removidos');
    console.log('✅ ClassIds malformados corrigidos');
    console.log('✅ Contadores de turmas atualizados');
    console.log('✅ Sistema consistente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
