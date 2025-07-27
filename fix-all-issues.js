/**
 * Script para corrigir todos os problemas identificados:
 * 1. Garantir que turmas tenham códigos de convite válidos
 * 2. Corrigir status inconsistentes de turmas
 * 3. Verificar e corrigir matrículas de estudantes
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, writeBatch, query, where } = require('firebase/firestore');

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

function generateClassCode(className, year) {
  const classPrefix = className
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .substring(0, 4)
    .padEnd(4, 'X');
  
  const yearSuffix = year.toString().slice(-2);
  const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
  
  return `${classPrefix}${yearSuffix}${randomSuffix}`;
}

async function fixAllIssues() {
  console.log('🔧 INICIANDO CORREÇÃO COMPLETA DOS PROBLEMAS');
  console.log('============================================');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}\n`);
  
  try {
    // 1. Corrigir turmas sem códigos de convite
    await fixClassesWithoutCodes();
    
    // 2. Corrigir status inconsistentes
    await fixInconsistentStatus();
    
    // 3. Verificar convites órfãos
    await fixOrphanedInvites();
    
    console.log('\n🎉 CORREÇÃO COMPLETA CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

async function fixClassesWithoutCodes() {
  console.log('🎫 1. CORRIGINDO TURMAS SEM CÓDIGOS DE CONVITE');
  console.log('==============================================');
  
  try {
    const snapshot = await getDocs(collection(db, 'classes'));
    console.log(`📊 Verificando ${snapshot.size} turmas...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const classId = docSnapshot.id;
      
      // Verificar se precisa de código
      const needsCode = !data.code || !data.inviteCode || 
                       data.code === 'CÓDIGO_PENDENTE' || 
                       data.inviteCode === 'CÓDIGO_PENDENTE';
      
      if (needsCode && data.status !== 'deleted') {
        console.log(`🔧 Corrigindo turma: ${data.name} (${classId})`);
        
        // Gerar novo código
        const newCode = generateClassCode(data.name || 'TURMA', data.year || 2025);
        console.log(`   Novo código: ${newCode}`);
        
        // Atualizar turma
        const classRef = doc(db, 'classes', classId);
        batch.update(classRef, {
          code: newCode,
          inviteCode: newCode,
          status: data.status === 'active' ? 'open' : (data.status || 'open'),
          codeGeneratedAt: new Date(),
          updatedAt: new Date()
        });
        
        // Criar convite correspondente
        const inviteRef = doc(db, 'classInvites', newCode);
        batch.set(inviteRef, {
          classId: classId,
          code: newCode,
          createdAt: new Date(),
          isActive: true,
          currentUses: 0,
          createdBy: data.professorId || 'system'
        });
        
        fixCount++;
        
        // Executar batch a cada 400 operações (limite do Firestore é 500)
        if (fixCount % 200 === 0) {
          console.log(`💾 Executando batch intermediário (${fixCount} correções)...`);
          await batch.commit();
          console.log('✅ Batch executado!');
        }
      }
    }
    
    // Executar batch final
    if (fixCount % 200 !== 0) {
      console.log(`💾 Executando batch final (${fixCount} correções)...`);
      await batch.commit();
      console.log('✅ Batch final executado!');
    }
    
    console.log(`✅ ${fixCount} turmas corrigidas com novos códigos`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir códigos de turmas:', error);
  }
}

async function fixInconsistentStatus() {
  console.log('\n📊 2. CORRIGINDO STATUS INCONSISTENTES');
  console.log('=====================================');
  
  try {
    const snapshot = await getDocs(collection(db, 'classes'));
    console.log(`📊 Verificando status de ${snapshot.size} turmas...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    snapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const classId = docSnapshot.id;
      const currentStatus = data.status;
      
      // Corrigir status problemáticos
      let newStatus = null;
      
      if (!currentStatus || currentStatus === 'undefined' || currentStatus === null) {
        newStatus = 'open';
        console.log(`🔧 ${data.name}: undefined → open`);
      } else if (currentStatus === 'active') {
        newStatus = 'open';
        console.log(`🔧 ${data.name}: active → open`);
      }
      
      if (newStatus) {
        const classRef = doc(db, 'classes', classId);
        batch.update(classRef, {
          status: newStatus,
          statusCorrectedAt: new Date(),
          updatedAt: new Date()
        });
        fixCount++;
      }
    });
    
    if (fixCount > 0) {
      console.log(`💾 Executando correções de status (${fixCount} turmas)...`);
      await batch.commit();
      console.log('✅ Status corrigidos!');
    } else {
      console.log('✅ Todos os status estão corretos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir status:', error);
  }
}

async function fixOrphanedInvites() {
  console.log('\n🔗 3. VERIFICANDO CONVITES ÓRFÃOS');
  console.log('=================================');
  
  try {
    const invitesSnapshot = await getDocs(collection(db, 'classInvites'));
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    console.log(`📊 Verificando ${invitesSnapshot.size} convites...`);
    
    // Criar mapa de turmas existentes
    const existingClasses = new Set();
    classesSnapshot.docs.forEach(doc => {
      existingClasses.add(doc.id);
    });
    
    const batch = writeBatch(db);
    let orphanCount = 0;
    let fixCount = 0;
    
    for (const inviteDoc of invitesSnapshot.docs) {
      const inviteData = inviteDoc.data();
      const code = inviteDoc.id;
      const classId = inviteData.classId;
      
      if (!existingClasses.has(classId)) {
        console.log(`⚠️ Convite órfão encontrado: ${code} → turma inexistente ${classId}`);
        
        // Desativar convite órfão
        batch.update(inviteDoc.ref, {
          isActive: false,
          orphanedAt: new Date(),
          orphanReason: 'Turma não encontrada'
        });
        
        orphanCount++;
        fixCount++;
      }
    }
    
    if (fixCount > 0) {
      console.log(`💾 Desativando ${fixCount} convites órfãos...`);
      await batch.commit();
      console.log('✅ Convites órfãos desativados!');
    } else {
      console.log('✅ Nenhum convite órfão encontrado');
    }
    
    console.log(`📊 Resumo: ${orphanCount} convites órfãos encontrados`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar convites órfãos:', error);
  }
}

// Executar correções
fixAllIssues()
  .then(() => {
    console.log('\n🎉 Script de correção concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
