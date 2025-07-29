/**
 * Script para investigar problemas específicos de usuário:
 * 1. Verificar se anonymousId está presente e correto (4 dígitos)
 * 2. Verificar se usuário está associado a turmas
 * 3. Identificar causa do erro no ranking
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

async function investigateUserIssues(userEmail) {
  console.log('🔍 INVESTIGAÇÃO DE PROBLEMAS DO USUÁRIO');
  console.log('=====================================');
  console.log(`📧 Email: ${userEmail || 'NÃO ESPECIFICADO'}`);
  
  try {
    // 1. Buscar usuário por email
    console.log('\n📊 1. BUSCANDO USUÁRIO NO FIRESTORE:');
    
    let user = null;
    let userId = null;
    
    if (userEmail) {
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', userEmail)));
      if (usersSnapshot.size > 0) {
        const userDoc = usersSnapshot.docs[0];
        user = userDoc.data();
        userId = userDoc.id;
        console.log(`✅ Usuário encontrado! ID: ${userId}`);
      } else {
        console.log(`❌ Usuário com email ${userEmail} não encontrado`);
        return;
      }
    } else {
      console.log('⚠️ Email não especificado. Buscando todos os estudantes...');
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      console.log(`📈 Total de estudantes encontrados: ${usersSnapshot.size}`); 
      
      // Listar os primeiros 5 estudantes para investigação
      console.log('\n🔍 Estudantes encontrados (primeiros 5):');
      let count = 0;
      usersSnapshot.forEach((doc) => {
        if (count < 5) {
          const userData = doc.data();
          console.log(`  - ${userData.email} (ID: ${doc.id}) - Anonymous ID: ${userData.anonymousId || 'AUSENTE'}`);
          count++;
        }
      });
      return;
    }
    
    // 2. Analisar dados do usuário
    console.log('\n👤 2. ANÁLISE DO PERFIL DO USUÁRIO:');
    console.log(`   Nome: ${user.fullName || user.name || 'NÃO INFORMADO'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID UID: ${userId}`);
    console.log(`   Anonymous ID: ${user.anonymousId || '❌ AUSENTE'}`);
    
    if (user.anonymousId) {
      const isValid4Digits = /^\d{4}$/.test(user.anonymousId);
      console.log(`   📏 Anonymous ID válido (4 dígitos): ${isValid4Digits ? '✅' : '❌'}`);
      if (!isValid4Digits) {
        console.log(`   ⚠️ Anonymous ID atual: "${user.anonymousId}" (não é 4 dígitos)`);
      }
    } else {
      console.log(`   🚨 PROBLEMA CRÍTICO: Anonymous ID ausente para estudante!`);
    }
    
    // 3. Verificar associações com turmas
    console.log('\n🏫 3. VERIFICANDO ASSOCIAÇÕES COM TURMAS:');
    
    // Verificar em classStudents
    const classStudentsQuery = query(collection(db, 'classStudents'), where('studentId', '==', userId));
    const classStudentsSnapshot = await getDocs(classStudentsQuery);
    console.log(`   classStudents: ${classStudentsSnapshot.size} registros`);
    
    if (classStudentsSnapshot.size > 0) {
      classStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`     - Turma: ${data.classId} | Nome: ${data.studentName || 'N/A'} | Anonymous ID: ${data.anonymousId || 'AUSENTE'}`);
      });
    }
    
    // Verificar em class_students (alternativo)
    const altClassStudentsQuery = query(collection(db, 'class_students'), where('studentId', '==', userId));
    const altClassStudentsSnapshot = await getDocs(altClassStudentsQuery);
    console.log(`   class_students: ${altClassStudentsSnapshot.size} registros`);
    
    if (altClassStudentsSnapshot.size > 0) {
      altClassStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`     - Turma: ${data.classId} | Nome: ${data.studentName || 'N/A'} | Anonymous ID: ${data.anonymousId || 'AUSENTE'}`);
      });
    }
    
    // 4. Verificar se usuário tem pontuações
    console.log('\n📊 4. VERIFICANDO PONTUAÇÕES DO USUÁRIO:');
    
    const scoresQuery = query(collection(db, 'unified_scores'), where('userId', '==', userId));
    const scoresSnapshot = await getDocs(scoresQuery);
    console.log(`   unified_scores: ${scoresSnapshot.size} registros`);
    
    if (scoresSnapshot.size > 0) {
      scoresSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`     - Jogo: ${data.gameId} | Score: ${data.normalizedScore || data.score} | Data: ${data.completedAt?.toDate?.() || data.completedAt}`);
      });
    }
    
    // 5. Buscar turmas disponíveis
    console.log('\n🏫 5. TURMAS DISPONÍVEIS NO SISTEMA:');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`   Total de turmas: ${classesSnapshot.size}`);
    
    if (classesSnapshot.size > 0) {
      console.log('   Turmas encontradas:');
      classesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`     - ${data.name} (ID: ${doc.id}) | Professor: ${data.professorId || 'N/A'} | Estudantes: ${data.studentsCount || data.studentIds?.length || 0}`);
      });
    }
    
    // 6. Diagnóstico e recomendações
    console.log('\n🔧 6. DIAGNÓSTICO E RECOMENDAÇÕES:');
    
    const issues = [];
    const recommendations = [];
    
    if (!user.anonymousId) {
      issues.push('Anonymous ID ausente');
      recommendations.push('Gerar Anonymous ID de 4 dígitos para o usuário');
    } else if (!/^\d{4}$/.test(user.anonymousId)) {
      issues.push(`Anonymous ID inválido: "${user.anonymousId}"`);
      recommendations.push('Corrigir Anonymous ID para formato de 4 dígitos');
    }
    
    if (classStudentsSnapshot.size === 0 && altClassStudentsSnapshot.size === 0) {
      issues.push('Usuário não está associado a nenhuma turma');
      recommendations.push('Associar usuário a uma turma padrão ou permitir criação automática');
    }
    
    if (scoresSnapshot.size === 0) {
      issues.push('Usuário não tem pontuações registradas');
      recommendations.push('Verificar se usuário completou algum jogo/exercício');
    }
    
    console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
    if (issues.length === 0) {
      console.log('   ✅ Nenhum problema crítico encontrado!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n💡 RECOMENDAÇÕES:');
    if (recommendations.length === 0) {
      console.log('   ✅ Sistema parece estar funcionando corretamente para este usuário.');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na investigação:', error);
  }
}

// Executar o script
const args = process.argv.slice(2);
const userEmail = args[0];

if (!userEmail) {
  console.log('📋 USO: node investigate-user-issues.js <email-do-usuario>');
  console.log('📋 Exemplo: node investigate-user-issues.js usuario@dac.unicamp.br');
  console.log('\n🔍 Ou execute sem parâmetros para ver todos os estudantes:');
  console.log('📋 node investigate-user-issues.js');
}

investigateUserIssues(userEmail).then(() => {
  console.log('\n✅ Investigação concluída!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});