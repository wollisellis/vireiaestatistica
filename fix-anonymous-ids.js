/**
 * Script para corrigir anonymousIds faltantes
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } = require('firebase/firestore');

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

function generateAnonymousId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function fixAnonymousIds() {
  console.log('🆔 CORRIGINDO ANONYMOUS IDS FALTANTES');
  console.log('====================================');
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Verificando ${usersSnapshot.size} usuários...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Verificar se é estudante sem anonymousId
      if (userData.role === 'student' && !userData.anonymousId) {
        const anonymousId = generateAnonymousId();
        
        console.log(`🔧 Gerando anonymousId para: ${userData.fullName || userData.email}`);
        console.log(`   Novo anonymousId: ${anonymousId}`);
        
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, {
          anonymousId: anonymousId,
          anonymousIdGeneratedAt: new Date(),
          updatedAt: new Date()
        });
        fixCount++;
      }
    }
    
    if (fixCount > 0) {
      console.log(`💾 Aplicando ${fixCount} anonymousIds...`);
      await batch.commit();
      console.log('✅ AnonymousIds aplicados!');
    } else {
      console.log('✅ Todos os estudantes já têm anonymousId');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir anonymousIds:', error);
  }
}

fixAnonymousIds()
  .then(() => {
    console.log('\n🎉 Correção de anonymousIds concluída!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
