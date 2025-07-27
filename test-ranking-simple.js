// Script simples para testar dados do ranking
console.log('🔍 Iniciando teste dos dados do ranking...');

// Configuração direta do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:564836c9876cf33d2a9436"
};

console.log('🔥 Configuração Firebase:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Usar fetch para fazer requisições diretas à API REST do Firestore
async function testFirestoreData() {
  const projectId = firebaseConfig.projectId;
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  
  try {
    console.log('\n📊 Testando acesso às coleções...');
    
    // Testar coleção unified_scores
    console.log('\n1. Testando unified_scores...');
    try {
      const response = await fetch(`${baseUrl}/unified_scores`);
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        console.log(`   ✅ unified_scores: ${documents.length} documentos`);
        
        documents.forEach((doc, index) => {
          if (index < 3) { // Mostrar apenas os primeiros 3
            const docId = doc.name.split('/').pop();
            const fields = doc.fields || {};
            console.log(`   📄 ${docId}:`, {
              totalScore: fields.totalScore?.doubleValue || fields.totalScore?.integerValue || 0,
              normalizedScore: fields.normalizedScore?.doubleValue || fields.normalizedScore?.integerValue || 0
            });
          }
        });
      } else {
        console.log(`   ❌ unified_scores: Erro ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ unified_scores: Erro de conexão - ${error.message}`);
    }
    
    // Testar coleção users
    console.log('\n2. Testando users...');
    try {
      const response = await fetch(`${baseUrl}/users`);
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        console.log(`   ✅ users: ${documents.length} documentos`);
        
        documents.forEach((doc, index) => {
          if (index < 3) { // Mostrar apenas os primeiros 3
            const docId = doc.name.split('/').pop();
            const fields = doc.fields || {};
            console.log(`   👤 ${docId}:`, {
              fullName: fields.fullName?.stringValue || 'N/A',
              email: fields.email?.stringValue || 'N/A',
              role: fields.role?.stringValue || 'N/A'
            });
          }
        });
      } else {
        console.log(`   ❌ users: Erro ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ users: Erro de conexão - ${error.message}`);
    }
    
    // Testar coleção classStudents
    console.log('\n3. Testando classStudents...');
    try {
      const response = await fetch(`${baseUrl}/classStudents`);
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        console.log(`   ✅ classStudents: ${documents.length} documentos`);
        
        documents.forEach((doc, index) => {
          if (index < 3) { // Mostrar apenas os primeiros 3
            const docId = doc.name.split('/').pop();
            const fields = doc.fields || {};
            console.log(`   🎓 ${docId}:`, {
              studentId: fields.studentId?.stringValue || 'N/A',
              classId: fields.classId?.stringValue || 'N/A',
              status: fields.status?.stringValue || 'N/A'
            });
          }
        });
      } else {
        console.log(`   ❌ classStudents: Erro ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ classStudents: Erro de conexão - ${error.message}`);
    }
    
    // Testar coleção student_module_progress
    console.log('\n4. Testando student_module_progress...');
    try {
      const response = await fetch(`${baseUrl}/student_module_progress`);
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        console.log(`   ✅ student_module_progress: ${documents.length} documentos`);
        
        documents.forEach((doc, index) => {
          if (index < 3) { // Mostrar apenas os primeiros 3
            const docId = doc.name.split('/').pop();
            const fields = doc.fields || {};
            console.log(`   📈 ${docId}:`, {
              studentId: fields.studentId?.stringValue || 'N/A',
              moduleId: fields.moduleId?.stringValue || 'N/A',
              completed: fields.completed?.booleanValue || false,
              score: fields.score?.doubleValue || fields.score?.integerValue || 0
            });
          }
        });
      } else {
        console.log(`   ❌ student_module_progress: Erro ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ student_module_progress: Erro de conexão - ${error.message}`);
    }
    
    // Testar coleção quiz_attempts
    console.log('\n5. Testando quiz_attempts...');
    try {
      const response = await fetch(`${baseUrl}/quiz_attempts`);
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        console.log(`   ✅ quiz_attempts: ${documents.length} documentos`);
        
        documents.forEach((doc, index) => {
          if (index < 3) { // Mostrar apenas os primeiros 3
            const docId = doc.name.split('/').pop();
            const fields = doc.fields || {};
            console.log(`   📝 ${docId}:`, {
              studentId: fields.studentId?.stringValue || 'N/A',
              moduleId: fields.moduleId?.stringValue || 'N/A',
              score: fields.score?.doubleValue || fields.score?.integerValue || 0,
              completed: fields.completed?.booleanValue || false
            });
          }
        });
      } else {
        console.log(`   ❌ quiz_attempts: Erro ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ quiz_attempts: Erro de conexão - ${error.message}`);
    }
    
    console.log('\n✅ Teste concluído!');
    console.log('\n🔍 DIAGNÓSTICO:');
    console.log('   Se unified_scores está vazio mas há dados em outras coleções,');
    console.log('   o problema é que o sistema de pontuação unificada não foi executado.');
    console.log('   O ranking depende da coleção unified_scores para funcionar.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testFirestoreData();
