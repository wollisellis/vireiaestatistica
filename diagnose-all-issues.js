/**
 * Script completo para diagnosticar todos os problemas identificados:
 * 1. Estudantes não aparecem na página de detalhes da turma
 * 2. Turma restaurada desapareceu
 * 3. Código de convite aparece como "pendente"
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy } = require('firebase/firestore');

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

async function diagnoseAllIssues() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DOS PROBLEMAS');
  console.log('=====================================');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}\n`);
  
  try {
    // 1. DIAGNÓSTICO: Turmas e seus status
    await diagnoseTurmas();
    
    // 2. DIAGNÓSTICO: Estudantes por turma
    await diagnoseEstudantes();
    
    // 3. DIAGNÓSTICO: Códigos de convite
    await diagnoseConvites();
    
    // 4. DIAGNÓSTICO: Turmas excluídas/restauradas
    await diagnoseTurmasExcluidas();
    
    console.log('\n🎉 DIAGNÓSTICO COMPLETO CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
}

async function diagnoseTurmas() {
  console.log('📋 1. DIAGNÓSTICO: TURMAS E STATUS');
  console.log('==================================');
  
  try {
    const snapshot = await getDocs(collection(db, 'classes'));
    console.log(`📊 Total de turmas encontradas: ${snapshot.size}`);
    
    const statusCount = {};
    const turmasPorProfessor = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'undefined';
      const professorId = data.professorId || 'undefined';
      
      // Contar por status
      statusCount[status] = (statusCount[status] || 0) + 1;
      
      // Agrupar por professor
      if (!turmasPorProfessor[professorId]) {
        turmasPorProfessor[professorId] = [];
      }
      
      turmasPorProfessor[professorId].push({
        id: doc.id,
        name: data.name,
        status: status,
        code: data.code || data.inviteCode,
        studentsCount: data.studentsCount || 0
      });
    });
    
    console.log('\n📊 Distribuição por status:');
    Object.keys(statusCount).forEach(status => {
      console.log(`   ${status}: ${statusCount[status]} turmas`);
    });
    
    console.log('\n👥 Turmas por professor:');
    Object.keys(turmasPorProfessor).forEach(professorId => {
      const turmas = turmasPorProfessor[professorId];
      console.log(`\n🧑‍🏫 Professor: ${professorId}`);
      console.log(`   📚 Total de turmas: ${turmas.length}`);
      
      turmas.forEach(turma => {
        console.log(`   - ${turma.name} (${turma.id})`);
        console.log(`     Status: ${turma.status}`);
        console.log(`     Código: ${turma.code || 'SEM CÓDIGO'}`);
        console.log(`     Estudantes: ${turma.studentsCount}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico de turmas:', error);
  }
}

async function diagnoseEstudantes() {
  console.log('\n\n👥 2. DIAGNÓSTICO: ESTUDANTES POR TURMA');
  console.log('=======================================');
  
  try {
    const snapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`📊 Total de matrículas encontradas: ${snapshot.size}`);
    
    const estudantesPorTurma = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const classId = data.classId;
      const docId = doc.id;
      
      if (!classId) {
        console.log(`⚠️ Documento sem classId: ${docId}`);
        return;
      }
      
      if (!estudantesPorTurma[classId]) {
        estudantesPorTurma[classId] = [];
      }
      
      estudantesPorTurma[classId].push({
        docId,
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        status: data.status,
        registeredAt: data.registeredAt
      });
    });
    
    console.log('\n📋 Estudantes por turma:');
    Object.keys(estudantesPorTurma).forEach(classId => {
      const estudantes = estudantesPorTurma[classId];
      console.log(`\n🏫 Turma: ${classId}`);
      console.log(`   👥 Total de estudantes: ${estudantes.length}`);
      
      estudantes.forEach(estudante => {
        console.log(`   - ${estudante.studentName} (${estudante.studentEmail})`);
        console.log(`     Status: ${estudante.status}`);
        console.log(`     Doc ID: ${estudante.docId}`);
      });
    });
    
    // Testar consultas específicas
    console.log('\n🧪 TESTANDO CONSULTAS ESPECÍFICAS:');
    const primeiraClassId = Object.keys(estudantesPorTurma)[0];
    if (primeiraClassId) {
      await testClassStudentQueries(primeiraClassId);
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico de estudantes:', error);
  }
}

async function testClassStudentQueries(classId) {
  console.log(`\n🔍 Testando consultas para turma: ${classId}`);
  
  // Teste 1: Query básica por classId
  try {
    const q1 = query(collection(db, 'classStudents'), where('classId', '==', classId));
    const snapshot1 = await getDocs(q1);
    console.log(`   ✅ Query por classId: ${snapshot1.size} resultados`);
  } catch (error) {
    console.log(`   ❌ Query por classId falhou: ${error.message}`);
  }
  
  // Teste 2: Query por range de document IDs
  try {
    const q2 = query(
      collection(db, 'classStudents'),
      where('__name__', '>=', `${classId}_`),
      where('__name__', '<', `${classId}_\uf8ff`)
    );
    const snapshot2 = await getDocs(q2);
    console.log(`   ✅ Query por range de IDs: ${snapshot2.size} resultados`);
  } catch (error) {
    console.log(`   ❌ Query por range de IDs falhou: ${error.message}`);
  }
}

async function diagnoseConvites() {
  console.log('\n\n🎫 3. DIAGNÓSTICO: CÓDIGOS DE CONVITE');
  console.log('====================================');
  
  try {
    const snapshot = await getDocs(collection(db, 'classInvites'));
    console.log(`📊 Total de convites encontrados: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('❌ Nenhum convite encontrado na coleção classInvites');
      return;
    }
    
    console.log('\n📋 Lista de convites:');
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const code = doc.id;
      
      console.log(`\n🎫 Código: ${code}`);
      console.log(`   Turma: ${data.classId}`);
      console.log(`   Ativo: ${data.isActive}`);
      console.log(`   Criado por: ${data.createdBy}`);
      console.log(`   Usos: ${data.currentUses || 0}/${data.maxUses || 'ilimitado'}`);
      console.log(`   Criado em: ${data.createdAt?.toDate?.()?.toLocaleString('pt-BR') || 'N/A'}`);
      
      if (data.expiresAt) {
        const expiresAt = data.expiresAt.toDate();
        const isExpired = new Date() > expiresAt;
        console.log(`   Expira em: ${expiresAt.toLocaleString('pt-BR')} ${isExpired ? '(EXPIRADO)' : '(VÁLIDO)'}`);
      }
    });
    
    // Verificar se turmas têm códigos correspondentes
    console.log('\n🔍 Verificando correspondência turmas ↔ convites:');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    classesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const classId = doc.id;
      const code = data.code || data.inviteCode;
      
      if (code && code !== 'CÓDIGO_PENDENTE') {
        // Verificar se existe convite correspondente
        const hasInvite = snapshot.docs.some(inviteDoc => inviteDoc.id === code);
        console.log(`   ${hasInvite ? '✅' : '❌'} Turma ${data.name} (${classId}) → Código: ${code}`);
      } else {
        console.log(`   ⚠️ Turma ${data.name} (${classId}) → SEM CÓDIGO ou PENDENTE`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico de convites:', error);
  }
}

async function diagnoseTurmasExcluidas() {
  console.log('\n\n🗑️ 4. DIAGNÓSTICO: TURMAS EXCLUÍDAS/RESTAURADAS');
  console.log('===============================================');
  
  try {
    // Verificar turmas na lixeira
    const deletedSnapshot = await getDocs(collection(db, 'deleted_classes'));
    console.log(`📊 Turmas na lixeira: ${deletedSnapshot.size}`);
    
    if (deletedSnapshot.size > 0) {
      console.log('\n🗑️ Turmas na lixeira:');
      deletedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate();
        const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 0;
        
        console.log(`\n📄 ID: ${doc.id}`);
        console.log(`   Nome: ${data.originalData?.name || 'N/A'}`);
        console.log(`   Excluída em: ${data.deletedAt?.toDate?.()?.toLocaleString('pt-BR') || 'N/A'}`);
        console.log(`   Expira em: ${expiresAt?.toLocaleString('pt-BR') || 'N/A'}`);
        console.log(`   Dias restantes: ${daysRemaining}`);
        console.log(`   Pode restaurar: ${daysRemaining > 0 ? 'SIM' : 'NÃO'}`);
      });
    }
    
    // Verificar turmas com status 'deleted'
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const turmasComStatusDeleted = [];
    
    classesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'deleted') {
        turmasComStatusDeleted.push({
          id: doc.id,
          name: data.name,
          deletedAt: data.deletedAt?.toDate?.()?.toLocaleString('pt-BR') || 'N/A'
        });
      }
    });
    
    if (turmasComStatusDeleted.length > 0) {
      console.log(`\n⚠️ Turmas com status 'deleted' na coleção principal: ${turmasComStatusDeleted.length}`);
      turmasComStatusDeleted.forEach(turma => {
        console.log(`   - ${turma.name} (${turma.id}) - Excluída em: ${turma.deletedAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico de turmas excluídas:', error);
  }
}

// Executar diagnóstico
diagnoseAllIssues()
  .then(() => {
    console.log('\n🎉 Script de diagnóstico concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
