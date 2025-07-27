/**
 * Script de debug para verificar os dados da coleção classStudents
 * Execute no console do Firebase ou como script Node.js
 */

// Para usar no console do Firebase:
// 1. Vá para https://console.firebase.google.com/project/vireiestatistica-ba7c5/firestore/data
// 2. Abra o console do navegador (F12)
// 3. Cole este código e execute

async function debugClassStudents() {
  console.log('🔍 Iniciando debug da coleção classStudents...')
  
  try {
    // Buscar todos os documentos da coleção classStudents
    const snapshot = await firebase.firestore().collection('classStudents').get()
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}`)
    
    if (snapshot.empty) {
      console.log('❌ Nenhum documento encontrado na coleção classStudents')
      return
    }
    
    // Agrupar por turma
    const classesByTurma = {}
    const allStudents = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const docId = doc.id
      
      console.log(`📄 Documento: ${docId}`)
      console.log('   Dados:', data)
      
      // Extrair classId do documento ID (formato: classId_studentId)
      const classId = data.classId || docId.split('_')[0]
      
      if (!classesByTurma[classId]) {
        classesByTurma[classId] = []
      }
      
      classesByTurma[classId].push({
        docId,
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        status: data.status,
        classId: data.classId,
        registeredAt: data.registeredAt,
        enrolledAt: data.enrolledAt
      })
      
      allStudents.push({
        docId,
        classId,
        ...data
      })
    })
    
    console.log('\n📋 Resumo por turma:')
    Object.keys(classesByTurma).forEach(classId => {
      const students = classesByTurma[classId]
      console.log(`\n🏫 Turma: ${classId}`)
      console.log(`   👥 Estudantes: ${students.length}`)
      
      students.forEach(student => {
        console.log(`   - ${student.studentName} (${student.studentEmail})`)
        console.log(`     Status: ${student.status || 'undefined'}`)
        console.log(`     ClassId no doc: ${student.classId || 'undefined'}`)
        console.log(`     Doc ID: ${student.docId}`)
      })
    })
    
    // Verificar problemas comuns
    console.log('\n🔍 Verificando problemas comuns:')
    
    const semClassId = allStudents.filter(s => !s.classId)
    if (semClassId.length > 0) {
      console.log(`⚠️ ${semClassId.length} documentos sem campo classId:`)
      semClassId.forEach(s => console.log(`   - ${s.docId}`))
    }
    
    const semStatus = allStudents.filter(s => !s.status)
    if (semStatus.length > 0) {
      console.log(`⚠️ ${semStatus.length} documentos sem campo status:`)
      semStatus.forEach(s => console.log(`   - ${s.docId}`))
    }
    
    const statusInvalido = allStudents.filter(s => s.status && !['active', 'inactive', 'pending', 'removed'].includes(s.status))
    if (statusInvalido.length > 0) {
      console.log(`⚠️ ${statusInvalido.length} documentos com status inválido:`)
      statusInvalido.forEach(s => console.log(`   - ${s.docId}: ${s.status}`))
    }
    
    console.log('\n✅ Debug concluído!')
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error)
  }
}

// Executar o debug
debugClassStudents()

// Função adicional para testar consultas específicas
async function testClassQuery(classId) {
  console.log(`\n🔍 Testando consultas para turma: ${classId}`)
  
  try {
    // Teste 1: Query por classId
    console.log('Teste 1: Query por classId')
    const q1 = firebase.firestore().collection('classStudents').where('classId', '==', classId)
    const snapshot1 = await q1.get()
    console.log(`   Resultado: ${snapshot1.size} documentos`)
    
    // Teste 2: Query por range de document ID
    console.log('Teste 2: Query por range de document ID')
    const q2 = firebase.firestore().collection('classStudents')
      .where(firebase.firestore.FieldPath.documentId(), '>=', `${classId}_`)
      .where(firebase.firestore.FieldPath.documentId(), '<', `${classId}_\uf8ff`)
    const snapshot2 = await q2.get()
    console.log(`   Resultado: ${snapshot2.size} documentos`)
    
    // Teste 3: Query por classId e status
    console.log('Teste 3: Query por classId e status')
    const q3 = firebase.firestore().collection('classStudents')
      .where('classId', '==', classId)
      .where('status', 'in', ['active', 'inactive'])
    const snapshot3 = await q3.get()
    console.log(`   Resultado: ${snapshot3.size} documentos`)
    
  } catch (error) {
    console.error('❌ Erro nos testes de consulta:', error)
  }
}

// Para testar uma turma específica, execute:
// testClassQuery('ID_DA_TURMA_AQUI')
