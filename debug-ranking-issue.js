import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where, limit } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:564836c9876cf33d2a9436"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugRankingIssue() {
  console.log('🔍 INVESTIGANDO PROBLEMA DO RANKING');
  console.log('===================================\n');

  try {
    // 1. Verificar coleção users (estudantes)
    console.log('👥 1. Verificando estudantes na coleção users...');
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    console.log(`   📊 Total de estudantes encontrados: ${studentsSnapshot.size}`);
    
    const students = [];
    studentsSnapshot.forEach((doc) => {
      const data = doc.data();
      students.push({
        id: doc.id,
        name: data.fullName || data.name || 'Nome não disponível',
        email: data.email,
        anonymousId: data.anonymousId,
        lastActivity: data.lastActivity
      });
      console.log(`   - ${data.fullName || data.name || 'Nome não disponível'} (${doc.id.slice(-6)})`);
    });

    // 2. Verificar coleção classStudents (matrículas)
    console.log('\n🎓 2. Verificando matrículas na coleção classStudents...');
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`   📊 Total de matrículas encontradas: ${classStudentsSnapshot.size}`);
    
    const enrollments = [];
    const classesByStudent = {};
    
    classStudentsSnapshot.forEach((doc) => {
      const data = doc.data();
      enrollments.push({
        docId: doc.id,
        studentId: data.studentId,
        classId: data.classId,
        studentName: data.studentName,
        status: data.status || 'N/A',
        enrolledAt: data.enrolledAt
      });
      
      if (!classesByStudent[data.studentId]) {
        classesByStudent[data.studentId] = [];
      }
      classesByStudent[data.studentId].push(data.classId);
      
      console.log(`   - ${data.studentName || 'Nome não disponível'} → Turma: ${data.classId} (Status: ${data.status || 'N/A'})`);
    });

    // 3. Verificar coleção unified_scores (pontuações)
    console.log('\n🏆 3. Verificando pontuações na coleção unified_scores...');
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`   📊 Total de pontuações encontradas: ${scoresSnapshot.size}`);
    
    const scores = [];
    scoresSnapshot.forEach((doc) => {
      const data = doc.data();
      scores.push({
        studentId: doc.id,
        totalScore: data.totalScore || 0,
        normalizedScore: data.normalizedScore || 0,
        moduleScores: data.moduleScores || {},
        lastActivity: data.lastActivity
      });
      
      console.log(`   - Estudante ${doc.id.slice(-6)}: ${data.totalScore || 0} pontos (Normalizado: ${data.normalizedScore || 0})`);
    });

    // 4. Verificar coleção classes (turmas)
    console.log('\n🏫 4. Verificando turmas na coleção classes...');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`   📊 Total de turmas encontradas: ${classesSnapshot.size}`);
    
    const classes = [];
    classesSnapshot.forEach((doc) => {
      const data = doc.data();
      classes.push({
        id: doc.id,
        name: data.name,
        status: data.status,
        studentsCount: data.studentsCount || 0
      });
      
      console.log(`   - ${data.name} (${doc.id}) - Status: ${data.status || 'N/A'} - Estudantes: ${data.studentsCount || 0}`);
    });

    // 5. Análise cruzada dos dados
    console.log('\n🔍 5. ANÁLISE CRUZADA DOS DADOS:');
    console.log('================================');
    
    // Verificar estudantes sem matrícula
    const studentsWithoutEnrollment = students.filter(student => 
      !classesByStudent[student.id]
    );
    
    if (studentsWithoutEnrollment.length > 0) {
      console.log(`\n⚠️ ${studentsWithoutEnrollment.length} estudantes SEM matrícula em turmas:`);
      studentsWithoutEnrollment.forEach(student => {
        console.log(`   - ${student.name} (${student.id.slice(-6)})`);
      });
    } else {
      console.log('\n✅ Todos os estudantes estão matriculados em turmas');
    }
    
    // Verificar estudantes sem pontuação
    const studentIds = students.map(s => s.id);
    const studentsWithoutScores = studentIds.filter(studentId => 
      !scores.find(score => score.studentId === studentId)
    );
    
    if (studentsWithoutScores.length > 0) {
      console.log(`\n⚠️ ${studentsWithoutScores.length} estudantes SEM pontuação:`);
      for (const studentId of studentsWithoutScores) {
        const student = students.find(s => s.id === studentId);
        console.log(`   - ${student?.name || 'Nome não disponível'} (${studentId.slice(-6)})`);
      }
    } else {
      console.log('\n✅ Todos os estudantes têm pontuação registrada');
    }
    
    // Verificar estudantes com pontuação > 0
    const studentsWithPositiveScores = scores.filter(score => score.totalScore > 0);
    console.log(`\n📊 ${studentsWithPositiveScores.length} estudantes com pontuação > 0:`);
    studentsWithPositiveScores.forEach(score => {
      const student = students.find(s => s.id === score.studentId);
      console.log(`   - ${student?.name || 'Nome não disponível'}: ${score.totalScore} pontos`);
    });

    // 6. Testar query específica do ClassRankingPanel
    console.log('\n🧪 6. TESTANDO QUERY DO ClassRankingPanel:');
    console.log('==========================================');
    
    // Simular o que o ProfessorClassService.getStudentClasses faz
    if (students.length > 0) {
      const firstStudentId = students[0].id;
      console.log(`\nTestando para estudante: ${students[0].name} (${firstStudentId.slice(-6)})`);
      
      // Query que o ProfessorClassService usa
      const studentClassesQuery = query(
        collection(db, 'classStudents'),
        where('studentId', '==', firstStudentId)
      );
      
      const studentClassesSnapshot = await getDocs(studentClassesQuery);
      console.log(`   📚 Turmas encontradas para este estudante: ${studentClassesSnapshot.size}`);
      
      if (studentClassesSnapshot.size > 0) {
        const firstClass = studentClassesSnapshot.docs[0].data();
        console.log(`   🎯 Primeira turma: ${firstClass.classId}`);
        
        // Testar query que o enhancedClassService usa
        const classStudentsQuery = query(
          collection(db, 'classStudents'),
          where('classId', '==', firstClass.classId)
        );
        
        const classStudentsSnapshot = await getDocs(classStudentsQuery);
        console.log(`   👥 Estudantes na turma ${firstClass.classId}: ${classStudentsSnapshot.size}`);
        
        // Verificar se esses estudantes têm pontuação
        let studentsWithScoresInClass = 0;
        for (const doc of classStudentsSnapshot.docs) {
          const studentData = doc.data();
          const hasScore = scores.find(s => s.studentId === studentData.studentId && s.totalScore > 0);
          if (hasScore) {
            studentsWithScoresInClass++;
          }
        }
        
        console.log(`   🏆 Estudantes com pontuação na turma: ${studentsWithScoresInClass}`);
        
        if (studentsWithScoresInClass === 0) {
          console.log('\n❌ PROBLEMA IDENTIFICADO: Nenhum estudante na turma tem pontuação > 0');
          console.log('💡 SOLUÇÃO: Os estudantes precisam completar exercícios para aparecer no ranking');
        } else {
          console.log('\n✅ Dados suficientes para exibir ranking');
        }
      } else {
        console.log('\n❌ PROBLEMA IDENTIFICADO: Estudante não está matriculado em nenhuma turma');
      }
    }

    // 7. Resumo final
    console.log('\n📋 7. RESUMO FINAL:');
    console.log('==================');
    console.log(`👥 Estudantes cadastrados: ${students.length}`);
    console.log(`🎓 Matrículas ativas: ${enrollments.filter(e => e.status !== 'removed').length}`);
    console.log(`🏆 Estudantes com pontuação: ${scores.length}`);
    console.log(`📊 Estudantes com pontuação > 0: ${studentsWithPositiveScores.length}`);
    console.log(`🏫 Turmas ativas: ${classes.filter(c => c.status !== 'deleted').length}`);
    
    if (studentsWithPositiveScores.length === 0) {
      console.log('\n🎯 DIAGNÓSTICO: O ranking não aparece porque nenhum estudante tem pontuação > 0');
      console.log('💡 RECOMENDAÇÃO: Peça aos estudantes para completarem o Módulo 1 para aparecerem no ranking');
    } else if (studentsWithoutEnrollment.length > 0) {
      console.log('\n🎯 DIAGNÓSTICO: Alguns estudantes não estão matriculados em turmas');
      console.log('💡 RECOMENDAÇÃO: Verifique as matrículas dos estudantes');
    } else {
      console.log('\n✅ DIAGNÓSTICO: Dados parecem estar corretos. Pode ser um problema de interface ou cache');
    }

  } catch (error) {
    console.error('❌ Erro durante a investigação:', error);
  }
}

// Executar o debug
debugRankingIssue().then(() => {
  console.log('\n🏁 Investigação concluída!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
