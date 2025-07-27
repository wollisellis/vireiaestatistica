import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

async function fixRankingData() {
  console.log('🔧 CORRIGINDO DADOS DO RANKING');
  console.log('==============================\n');

  try {
    // 1. Buscar todas as matrículas ativas
    console.log('📚 1. Buscando matrículas ativas...');
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    const enrollments = [];
    
    classStudentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status !== 'removed') {
        enrollments.push({
          docId: doc.id,
          studentId: data.studentId,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          classId: data.classId,
          status: data.status || 'active',
          enrolledAt: data.enrolledAt
        });
      }
    });
    
    console.log(`   ✅ Encontradas ${enrollments.length} matrículas ativas`);

    // 2. Para cada matrícula, verificar/criar usuário na coleção users
    console.log('\n👥 2. Verificando/criando usuários...');
    let usersCreated = 0;
    let usersUpdated = 0;
    
    for (const enrollment of enrollments) {
      const { studentId, studentName, studentEmail } = enrollment;
      
      console.log(`\n   🔍 Processando: ${studentName} (${studentId.slice(-6)})`);
      
      // Verificar se usuário já existe
      const userDoc = await getDoc(doc(db, 'users', studentId));
      
      if (!userDoc.exists()) {
        // Criar novo usuário
        console.log(`   📝 Criando usuário para: ${studentName}`);
        
        const userData = {
          uid: studentId,
          email: studentEmail || `${studentId}@temp.unicamp.br`,
          fullName: studentName,
          name: studentName,
          role: 'student',
          status: 'active',
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp(),
          // Gerar anonymousId único para o ranking
          anonymousId: `EST${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          // Dados adicionais para compatibilidade
          displayName: studentName,
          photoURL: null,
          emailVerified: false,
          // Metadados do sistema
          source: 'ranking-fix-script',
          version: '1.0'
        };
        
        await setDoc(doc(db, 'users', studentId), userData);
        usersCreated++;
        console.log(`   ✅ Usuário criado com anonymousId: ${userData.anonymousId}`);
        
      } else {
        // Verificar se precisa atualizar role
        const userData = userDoc.data();
        
        if (userData.role !== 'student') {
          console.log(`   🔄 Atualizando role para student: ${studentName}`);
          
          await updateDoc(doc(db, 'users', studentId), {
            role: 'student',
            lastActivity: serverTimestamp(),
            // Adicionar anonymousId se não existir
            ...((!userData.anonymousId) && {
              anonymousId: `EST${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            })
          });
          usersUpdated++;
          console.log(`   ✅ Usuário atualizado`);
        } else {
          console.log(`   ✅ Usuário já está correto`);
        }
      }
    }

    // 3. Verificar pontuações existentes
    console.log('\n🏆 3. Verificando pontuações...');
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    const scoresCount = scoresSnapshot.size;
    
    console.log(`   📊 Encontradas ${scoresCount} pontuações registradas`);
    
    scoresSnapshot.forEach((doc) => {
      const data = doc.data();
      const studentId = doc.id;
      console.log(`   - ${studentId.slice(-6)}: ${data.totalScore || 0} pontos`);
    });

    // 4. Testar query do ranking
    console.log('\n🧪 4. Testando query do ranking...');
    
    // Simular a query que o ClassRankingPanel faz
    const studentsQuery = collection(db, 'users');
    const studentsSnapshot = await getDocs(studentsQuery);
    
    let studentCount = 0;
    studentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.role === 'student') {
        studentCount++;
        console.log(`   ✅ Estudante encontrado: ${data.fullName || data.name} (${data.anonymousId || 'N/A'})`);
      }
    });

    // 5. Resumo final
    console.log('\n📋 5. RESUMO DA CORREÇÃO:');
    console.log('========================');
    console.log(`👥 Usuários criados: ${usersCreated}`);
    console.log(`🔄 Usuários atualizados: ${usersUpdated}`);
    console.log(`📚 Matrículas processadas: ${enrollments.length}`);
    console.log(`🏆 Pontuações existentes: ${scoresCount}`);
    console.log(`✅ Estudantes no ranking: ${studentCount}`);
    
    if (studentCount > 0) {
      console.log('\n🎉 SUCESSO! O ranking agora deve funcionar corretamente!');
      console.log('💡 Novos estudantes que se matricularem também aparecerão automaticamente.');
    } else {
      console.log('\n⚠️ ATENÇÃO: Ainda não há estudantes visíveis no ranking.');
      console.log('🔍 Verifique se os dados foram salvos corretamente.');
    }

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar a correção
fixRankingData().then(() => {
  console.log('\n🏁 Correção concluída!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
