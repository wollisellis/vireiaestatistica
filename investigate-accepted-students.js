/**
 * Script para investigar estudantes que realmente aceitaram convites
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where } = require('firebase/firestore');

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

async function investigateAcceptedStudents() {
  console.log('🔍 INVESTIGANDO ESTUDANTES QUE ACEITARAM CONVITES');
  console.log('================================================');
  
  try {
    // 1. Buscar a turma "Avaliação Nutricionala" especificamente
    console.log('\n📚 1. BUSCANDO TURMA "AVALIAÇÃO NUTRICIONALA":');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    let targetClass = null;
    
    classesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.includes('Avaliação Nutricionala')) {
        targetClass = {
          id: doc.id,
          name: data.name,
          studentsCount: data.studentsCount || 0,
          inviteCode: data.inviteCode,
          createdAt: data.createdAt
        };
      }
    });
    
    if (!targetClass) {
      console.log('❌ Turma "Avaliação Nutricionala" não encontrada');
      return;
    }
    
    console.log(`✅ Turma encontrada:`);
    console.log(`   ID: ${targetClass.id}`);
    console.log(`   Nome: ${targetClass.name}`);
    console.log(`   Contador atual: ${targetClass.studentsCount}`);
    console.log(`   Código de convite: ${targetClass.inviteCode || 'N/A'}`);
    
    // 2. Buscar TODOS os registros de estudantes desta turma
    console.log('\n👥 2. BUSCANDO TODOS OS REGISTROS DE ESTUDANTES:');
    
    // Método 1: Por classId
    const studentsQuery1 = query(
      collection(db, 'classStudents'),
      where('classId', '==', targetClass.id)
    );
    const studentsSnapshot1 = await getDocs(studentsQuery1);
    
    console.log(`📊 Método 1 (classId): ${studentsSnapshot1.size} registros encontrados`);
    
    const allStudents = [];
    studentsSnapshot1.docs.forEach(doc => {
      const data = doc.data();
      allStudents.push({
        docId: doc.id,
        method: 'classId',
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        status: data.status,
        registeredAt: data.registeredAt,
        enrolledAt: data.enrolledAt,
        inviteCode: data.inviteCode,
        classId: data.classId
      });
    });
    
    // Método 2: Buscar todos e filtrar por ID que contém o classId
    const allStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`📊 Total de registros na coleção: ${allStudentsSnapshot.size}`);
    
    allStudentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      
      // Verificar se o docId contém o classId da turma
      if (docId.includes(targetClass.id)) {
        // Verificar se já não foi adicionado pelo método 1
        const exists = allStudents.find(s => s.docId === docId);
        if (!exists) {
          allStudents.push({
            docId: docId,
            method: 'docId',
            studentId: data.studentId,
            studentName: data.studentName,
            studentEmail: data.studentEmail,
            status: data.status,
            registeredAt: data.registeredAt,
            enrolledAt: data.enrolledAt,
            inviteCode: data.inviteCode,
            classId: data.classId
          });
        }
      }
    });
    
    console.log(`📊 Total de estudantes encontrados: ${allStudents.length}`);
    
    // 3. Analisar status dos estudantes
    console.log('\n📋 3. ANÁLISE DETALHADA DOS ESTUDANTES:');
    
    const studentsByStatus = {
      active: [],
      inactive: [],
      pending: [],
      undefined: []
    };
    
    allStudents.forEach(student => {
      const status = student.status || 'undefined';
      studentsByStatus[status].push(student);
      
      console.log(`\n👤 ${student.studentName || 'Nome não disponível'}`);
      console.log(`   DocId: ${student.docId}`);
      console.log(`   StudentId: ${student.studentId?.slice(-6) || 'N/A'}`);
      console.log(`   Email: ${student.studentEmail || 'N/A'}`);
      console.log(`   Status: ${student.status || 'UNDEFINED'}`);
      console.log(`   Método encontrado: ${student.method}`);
      console.log(`   Registrado em: ${student.registeredAt ? new Date(student.registeredAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
      console.log(`   Código usado: ${student.inviteCode || 'N/A'}`);
    });
    
    // 4. Resumo por status
    console.log('\n📊 4. RESUMO POR STATUS:');
    Object.keys(studentsByStatus).forEach(status => {
      const students = studentsByStatus[status];
      if (students.length > 0) {
        console.log(`\n${status.toUpperCase()}: ${students.length} estudante(s)`);
        students.forEach(student => {
          console.log(`   - ${student.studentName} (${student.studentEmail})`);
        });
      }
    });
    
    // 5. Verificar se há estudantes ativos que deveriam ser contados
    const activeStudents = studentsByStatus.active || [];
    const shouldCount = activeStudents.length;
    const currentCount = targetClass.studentsCount;
    
    console.log('\n🎯 5. ANÁLISE DO CONTADOR:');
    console.log(`   Estudantes ATIVOS encontrados: ${shouldCount}`);
    console.log(`   Contador atual na turma: ${currentCount}`);
    
    if (shouldCount !== currentCount) {
      console.log(`   ⚠️ INCONSISTÊNCIA DETECTADA!`);
      console.log(`   O contador deveria ser: ${shouldCount}`);
      console.log(`   Diferença: ${Math.abs(shouldCount - currentCount)}`);
    } else {
      console.log(`   ✅ Contador está correto`);
    }
    
    // 6. Verificar convites da turma
    console.log('\n📨 6. VERIFICANDO CONVITES DA TURMA:');
    if (targetClass.inviteCode) {
      const inviteDoc = await getDoc(doc(db, 'classInvites', targetClass.inviteCode));
      if (inviteDoc.exists()) {
        const inviteData = inviteDoc.data();
        console.log(`   Código: ${targetClass.inviteCode}`);
        console.log(`   Ativo: ${inviteData.isActive ? 'Sim' : 'Não'}`);
        console.log(`   Usos atuais: ${inviteData.currentUses || 0}`);
        console.log(`   Limite de usos: ${inviteData.maxUses || 'Ilimitado'}`);
        console.log(`   Criado em: ${inviteData.createdAt ? new Date(inviteData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
      } else {
        console.log(`   ⚠️ Convite não encontrado: ${targetClass.inviteCode}`);
      }
    } else {
      console.log(`   ⚠️ Turma não tem código de convite`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante investigação:', error);
  }
}

async function checkAllClassesStudentCounts() {
  console.log('\n🔍 VERIFICANDO CONTADORES DE TODAS AS TURMAS:');
  console.log('=============================================');
  
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      // Contar estudantes ativos
      const activeStudentsQuery = query(
        collection(db, 'classStudents'),
        where('classId', '==', classId),
        where('status', '==', 'active')
      );
      
      try {
        const activeStudentsSnapshot = await getDocs(activeStudentsQuery);
        const activeCount = activeStudentsSnapshot.size;
        const storedCount = classData.studentsCount || 0;
        
        if (activeCount > 0 || storedCount > 0) {
          console.log(`\n📚 ${classData.name}`);
          console.log(`   Estudantes ativos reais: ${activeCount}`);
          console.log(`   Contador armazenado: ${storedCount}`);
          
          if (activeCount !== storedCount) {
            console.log(`   ⚠️ INCONSISTÊNCIA: ${storedCount} → deveria ser ${activeCount}`);
          } else {
            console.log(`   ✅ Contador correto`);
          }
        }
      } catch (queryError) {
        console.log(`   ⚠️ Erro na query para ${classData.name}: ${queryError.message}`);
        
        // Fallback: buscar todos e filtrar
        const allStudentsQuery = query(
          collection(db, 'classStudents'),
          where('classId', '==', classId)
        );
        const allStudentsSnapshot = await getDocs(allStudentsQuery);
        const activeStudents = allStudentsSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.status === 'active';
        });
        
        const activeCount = activeStudents.length;
        const storedCount = classData.studentsCount || 0;
        
        if (activeCount > 0 || storedCount > 0) {
          console.log(`\n📚 ${classData.name} (fallback)`);
          console.log(`   Estudantes ativos reais: ${activeCount}`);
          console.log(`   Contador armazenado: ${storedCount}`);
          
          if (activeCount !== storedCount) {
            console.log(`   ⚠️ INCONSISTÊNCIA: ${storedCount} → deveria ser ${activeCount}`);
          } else {
            console.log(`   ✅ Contador correto`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar contadores:', error);
  }
}

// Executar investigação
investigateAcceptedStudents()
  .then(() => checkAllClassesStudentCounts())
  .then(() => {
    console.log('\n🎉 INVESTIGAÇÃO COMPLETA!');
    console.log('========================');
    console.log('Agora sabemos exatamente quais estudantes aceitaram os convites.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
