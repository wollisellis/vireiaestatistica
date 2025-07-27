/**
 * Script de migração para corrigir os dados da coleção classStudents
 * Adiciona o campo classId e corrige a estrutura dos documentos
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

function extractClassIdFromDocId(docId) {
  // Formato esperado: classId_studentId ou classId_timestamp_studentId
  // Exemplos:
  // - class_0l8qwEY8hLdjmnvlLuED47KdS053_1753028061362_0l8qwEY8hLdjmnvlLuED47KdS053
  // - class_g4RpPLPF3Ba6FpvZ3qBJ76Dcwht1_1753050888622_g4RpPLPF3Ba6FpvZ3qBJ76Dcwht1
  
  const parts = docId.split('_');
  
  if (parts.length >= 2) {
    // Se começa com "class_", o classId real está na segunda parte
    if (parts[0] === 'class' && parts.length >= 2) {
      return parts[1]; // Retorna o ID real da turma
    }
    
    // Caso contrário, assume que a primeira parte é o classId
    return parts[0];
  }
  
  return null;
}

async function migrateClassStudents() {
  console.log('🔧 Iniciando migração da coleção classStudents...');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}`);
  
  try {
    // Buscar todos os documentos da coleção classStudents
    console.log('📡 Buscando documentos da coleção classStudents...');
    const snapshot = await getDocs(collection(db, 'classStudents'));
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('❌ Nenhum documento encontrado na coleção classStudents');
      return;
    }
    
    const batch = writeBatch(db);
    let updateCount = 0;
    const maxBatchSize = 500; // Limite do Firestore
    
    console.log('\n🔄 Processando documentos...');
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      console.log(`\n📄 Processando: ${docId}`);
      
      // Extrair classId do document ID
      const extractedClassId = extractClassIdFromDocId(docId);
      
      if (!extractedClassId) {
        console.log(`⚠️ Não foi possível extrair classId do documento: ${docId}`);
        continue;
      }
      
      console.log(`   ClassId extraído: ${extractedClassId}`);
      
      // Verificar se precisa atualizar
      const needsUpdate = !data.classId || data.classId !== extractedClassId;
      
      if (needsUpdate) {
        console.log(`   ✅ Adicionando classId: ${extractedClassId}`);
        
        // Adicionar ao batch
        const docRef = doc(db, 'classStudents', docId);
        batch.update(docRef, {
          classId: extractedClassId
        });
        
        updateCount++;
        
        // Executar batch se atingir o limite
        if (updateCount >= maxBatchSize) {
          console.log(`\n💾 Executando batch com ${updateCount} atualizações...`);
          await batch.commit();
          console.log('✅ Batch executado com sucesso!');
          
          // Reiniciar batch
          const newBatch = writeBatch(db);
          updateCount = 0;
        }
      } else {
        console.log(`   ⏭️ Documento já tem classId correto`);
      }
    }
    
    // Executar batch final se houver atualizações pendentes
    if (updateCount > 0) {
      console.log(`\n💾 Executando batch final com ${updateCount} atualizações...`);
      await batch.commit();
      console.log('✅ Batch final executado com sucesso!');
    }
    
    console.log('\n🎉 Migração concluída com sucesso!');
    console.log(`📊 Total de documentos atualizados: ${updateCount}`);
    
    // Verificar resultado
    console.log('\n🔍 Verificando resultado da migração...');
    await verifyMigration();
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

async function verifyMigration() {
  try {
    const snapshot = await getDocs(collection(db, 'classStudents'));
    
    let totalDocs = 0;
    let docsWithClassId = 0;
    const classesByTurma = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      
      totalDocs++;
      
      if (data.classId) {
        docsWithClassId++;
        
        if (!classesByTurma[data.classId]) {
          classesByTurma[data.classId] = [];
        }
        
        classesByTurma[data.classId].push({
          docId,
          studentName: data.studentName,
          studentEmail: data.studentEmail
        });
      }
    });
    
    console.log(`📊 Verificação da migração:`);
    console.log(`   Total de documentos: ${totalDocs}`);
    console.log(`   Documentos com classId: ${docsWithClassId}`);
    console.log(`   Taxa de sucesso: ${((docsWithClassId / totalDocs) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Estudantes por turma após migração:');
    Object.keys(classesByTurma).forEach(classId => {
      const students = classesByTurma[classId];
      console.log(`\n🏫 Turma: ${classId}`);
      console.log(`   👥 Estudantes: ${students.length}`);
      
      students.forEach(student => {
        console.log(`   - ${student.studentName} (${student.studentEmail})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar a migração
migrateClassStudents()
  .then(() => {
    console.log('\n🎉 Script de migração concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
