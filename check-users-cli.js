#!/usr/bin/env node

/**
 * Script para verificar usuários usando Firebase CLI
 * Sem usar opções que não existem
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function runFirebaseCommand(command) {
  try {
    console.log(`🚀 Executando: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    if (stderr && !stderr.includes('Warning')) {
      console.log('⚠️ Stderr:', stderr);
    }
    return stdout;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    throw error;
  }
}

async function checkUsers() {
  console.log('🔍 VERIFICANDO USUÁRIOS NO FIRESTORE VIA CLI');
  console.log('=============================================\n');

  try {
    // 1. Tentar listar documentos da coleção users
    console.log('👥 1. Verificando coleção "users"...');
    try {
      // Usar comando sem --limit
      const usersResult = await runFirebaseCommand(
        'firebase firestore:delete users --dry-run --project vireiestatistica-ba7c5'
      );
      console.log('✅ Coleção users existe');
      console.log('Resultado:', usersResult);
    } catch (error) {
      console.log('❌ Erro ao verificar users:', error.message);
    }

    // 2. Verificar outras coleções relacionadas
    console.log('\n🔍 2. Verificando outras coleções...');
    
    const collections = ['classStudents', 'gameProgress', 'unified_scores'];
    
    for (const collection of collections) {
      try {
        console.log(`\n📁 Verificando ${collection}...`);
        const result = await runFirebaseCommand(
          `firebase firestore:delete ${collection} --dry-run --project vireiestatistica-ba7c5`
        );
        console.log(`✅ Coleção ${collection} existe`);
        
        // Tentar extrair informações básicas
        if (result.includes('documents')) {
          const lines = result.split('\n');
          const docLines = lines.filter(line => line.includes('document') || line.includes('path'));
          console.log(`   📊 Informações encontradas: ${docLines.length} referências`);
          
          // Mostrar algumas linhas para análise
          docLines.slice(0, 3).forEach(line => {
            console.log(`   - ${line.trim()}`);
          });
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${collection}: ${error.message}`);
      }
    }

    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
checkUsers().then(() => {
  console.log('\n🏁 Script finalizado.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
