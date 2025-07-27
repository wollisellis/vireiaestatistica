/**
 * Script para investigar profundamente onde estão todos os estudantes
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

async function deepInvestigateStudents() {
  console.log('🔍 INVESTIGAÇÃO PROFUNDA DOS ESTUDANTES');
  console.log('======================================');
  
  try {
    // 1. Verificar todas as coleções relacionadas a estudantes
    console.log('\n📊 1. VERIFICANDO TODAS AS COLEÇÕES DE ESTUDANTES:');
    
    // Coleção classStudents
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`   classStudents: ${classStudentsSnapshot.size} registros`);
    
    // Coleção class_students
    const altClassStudentsSnapshot = await getDocs(collection(db, 'class_students'));
    console.log(`   class_students: ${altClassStudentsSnapshot.size} registros`);
    
    // Coleção users (estudantes)
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
    console.log(`   users (role=student): ${usersSnapshot.size} registros`);
    
    // Coleção unified_scores
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`   unified_scores: ${scoresSnapshot.size} registros`);
    
    // 2. Listar todos os estudantes encontrados em cada coleção
    console.log('\n👥 2. DETALHES DOS ESTUDANTES POR COLEÇÃO:');
    
    console.log('\n📋 classStudents:');
    if (classStudentsSnapshot.size > 0) {
      classStudentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.studentName || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
        console.log(`     Turma: ${data.classId}`);
        console.log(`     Status: ${data.status || 'N/A'}`);
        console.log(`     Email: ${data.studentEmail || 'N/A'}`);
      });
    } else {
      console.log('   (Nenhum registro encontrado)');
    }
    
    console.log('\n📋 class_students:');
    if (altClassStudentsSnapshot.size > 0) {
      altClassStudentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.studentName || data.name || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
        console.log(`     Turma: ${data.classId}`);
        console.log(`     Status: ${data.status || 'N/A'}`);
        console.log(`     Email: ${data.studentEmail || data.email || 'N/A'}`);
      });
    } else {
      console.log('   (Nenhum registro encontrado)');
    }
    
    console.log('\n📋 users (estudantes):');
    if (usersSnapshot.size > 0) {
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.fullName || data.name || 'Nome não disponível'} (${doc.id.slice(-6)})`);
        console.log(`     Email: ${data.email || 'N/A'}`);
        console.log(`     AnonymousId: ${data.anonymousId || 'N/A'}`);
        console.log(`     Criado em: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
      });
    } else {
      console.log('   (Nenhum registro encontrado)');
    }
    
    console.log('\n📋 unified_scores:');
    if (scoresSnapshot.size > 0) {
      for (const scoreDoc of scoresSnapshot.docs) {
        const scoreData = scoreDoc.data();
        const studentId = scoreDoc.id;
        
        // Buscar dados do usuário
        const userDoc = await getDoc(doc(db, 'users', studentId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        console.log(`   - ${userData?.fullName || 'Nome não disponível'} (${studentId.slice(-6)})`);
        console.log(`     Pontuação: ${scoreData.totalScore || 0}`);
        console.log(`     AnonymousId: ${userData?.anonymousId || 'N/A'}`);
      }
    } else {
      console.log('   (Nenhum registro encontrado)');
    }
    
    // 3. Verificar qual turma tem mais de 1 estudante
    console.log('\n🏫 3. ANÁLISE POR TURMA:');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      // Contar estudantes em ambas as coleções
      const studentsInClass1 = await getDocs(
        query(collection(db, 'classStudents'), where('classId', '==', classId))
      );
      
      const studentsInClass2 = await getDocs(
        query(collection(db, 'class_students'), where('classId', '==', classId))
      );
      
      const totalStudents = Math.max(studentsInClass1.size, studentsInClass2.size);
      
      if (totalStudents > 0) {
        console.log(`\n📚 Turma: ${classData.name}`);
        console.log(`   ID: ${classId}`);
        console.log(`   Contador no banco: ${classData.studentsCount || 0}`);
        console.log(`   Estudantes reais: ${totalStudents}`);
        
        // Listar estudantes desta turma
        if (studentsInClass1.size > 0) {
          console.log(`   📋 Estudantes (classStudents):`);
          studentsInClass1.docs.forEach(doc => {
            const data = doc.data();
            console.log(`      - ${data.studentName || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
          });
        }
        
        if (studentsInClass2.size > 0) {
          console.log(`   📋 Estudantes (class_students):`);
          studentsInClass2.docs.forEach(doc => {
            const data = doc.data();
            console.log(`      - ${data.studentName || data.name || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
          });
        }
      }
    }
    
    // 4. Verificar se há estudantes "órfãos" (com pontuação mas sem turma)
    console.log('\n🔍 4. VERIFICANDO ESTUDANTES ÓRFÃOS:');
    const allStudentIds = new Set();
    
    // Coletar IDs de estudantes em turmas
    classStudentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.studentId) allStudentIds.add(data.studentId);
    });
    
    altClassStudentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.studentId) allStudentIds.add(data.studentId);
    });
    
    // Verificar se há estudantes com pontuação que não estão em turmas
    const orphanStudents = [];
    for (const scoreDoc of scoresSnapshot.docs) {
      const studentId = scoreDoc.id;
      if (!allStudentIds.has(studentId)) {
        const userDoc = await getDoc(doc(db, 'users', studentId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        orphanStudents.push({
          id: studentId,
          name: userData?.fullName || 'Nome não disponível',
          score: scoreDoc.data().totalScore || 0
        });
      }
    }
    
    if (orphanStudents.length > 0) {
      console.log(`⚠️ Encontrados ${orphanStudents.length} estudantes órfãos (com pontuação mas sem turma):`);
      orphanStudents.forEach(student => {
        console.log(`   - ${student.name} (${student.id.slice(-6)}) - ${student.score} pontos`);
      });
    } else {
      console.log('✅ Nenhum estudante órfão encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro na investigação:', error);
  }
}

// Executar investigação
deepInvestigateStudents()
  .then(() => {
    console.log('\n🎯 INVESTIGAÇÃO COMPLETA!');
    console.log('========================');
    console.log('Agora sabemos exatamente onde estão todos os estudantes.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
