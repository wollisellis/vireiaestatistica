#!/usr/bin/env node

/**
 * 📋 CHANGELOG Update Helper
 * 
 * Script para facilitar a atualização do CHANGELOG.md seguindo as diretrizes
 * do "banco de memória" do projeto bioestat-platform.
 * 
 * Uso:
 *   node scripts/update-changelog.js
 *   
 * Ou adicionar como npm script:
 *   npm run changelog
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configurações
const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');

// Templates de categoria
const TEMPLATES = {
  '🐛': {
    name: 'Bug Fix',
    template: `- **[NOME_DO_BUG]**:
  - **Issue**: [Descrição do problema]
  - **Root Cause**: [Causa raiz identificada]
  - **Solution**: [Solução implementada]
  - **Files Modified**: [arquivo.ts:linha]
  - **Impact**: [Impacto para usuários]`
  },
  '✨': {
    name: 'New Feature',
    template: `- **[NOME_DA_FEATURE]**:
  - [Descrição detalhada da funcionalidade]
  - [Valor educacional/técnico agregado]
  - **Files Added**: [novos_arquivos.ts]
  - **Files Modified**: [arquivos_alterados.ts]
  - **Integration**: [Como se integra ao sistema]`
  },
  '🔧': {
    name: 'Improvement',
    template: `- **[NOME_DA_MELHORIA]**:
  - [Descrição da melhoria implementada]
  - [Métricas de performance se aplicável]
  - **Files Modified**: [arquivos.ts]`
  },
  '🎨': {
    name: 'UI/UX Improvement',
    template: `- **[NOME_DA_MELHORIA_UX]**:
  - [Descrição da melhoria visual/experiência]
  - [Feedback do usuário considerado]
  - **Files Modified**: [componentes.tsx]`
  },
  '📝': {
    name: 'Technical Details',
    template: `- **[MUDANÇA_TÉCNICA]**: [Descrição técnica]
- **[REFATORAÇÃO]**: [Melhorias de código/arquitetura]`
  },
  '⚠️': {
    name: 'Breaking Change',
    template: `- **[NOME_DA_MUDANÇA]**:
  - **Impact**: [O que quebra e por quê]
  - **Migration Required**: [Passos para migração]
  - **Affected Files**: [Arquivos afetados]
  - **Timeline**: [Quando será efetivo]`
  }
};

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function getCurrentVersion() {
  try {
    const package = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    return package.version;
  } catch (error) {
    console.error('❌ Erro ao ler package.json:', error.message);
    return '0.9.3'; // fallback
  }
}

function incrementVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function formatDate() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function generateVersionEntry(version, categories) {
  const date = formatDate();
  let entry = `## Version ${version} – ${date}\n\n`;
  
  Object.entries(categories).forEach(([emoji, content]) => {
    if (content.trim()) {
      const categoryName = TEMPLATES[emoji]?.name || 'Other';
      entry += `### ${emoji} **${categoryName}**\n${content}\n\n`;
    }
  });
  
  entry += '---\n\n';
  return entry;
}

function updateChangelog(newEntry) {
  try {
    const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    
    // Encontrar onde inserir (depois do cabeçalho, antes da primeira versão)
    const lines = content.split('\n');
    const insertIndex = lines.findIndex(line => line.startsWith('## Version'));
    
    if (insertIndex === -1) {
      throw new Error('Formato do CHANGELOG não reconhecido');
    }
    
    // Inserir nova entrada
    lines.splice(insertIndex, 0, newEntry);
    
    fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
    console.log('✅ CHANGELOG.md atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar CHANGELOG:', error.message);
  }
}

function updatePackageVersion(newVersion) {
  try {
    const package = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    package.version = newVersion;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(package, null, 2) + '\n');
    console.log(`✅ package.json atualizado para versão ${newVersion}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar package.json:', error.message);
  }
}

async function main() {
  console.log('📋 CHANGELOG Update Helper - bioestat-platform\n');
  
  const currentVersion = getCurrentVersion();
  console.log(`📦 Versão atual: ${currentVersion}\n`);
  
  // Escolher tipo de versão
  console.log('Que tipo de mudança você fez?');
  console.log('1. 🐛 Bug fix (PATCH)');
  console.log('2. ✨ Feature (MINOR)');
  console.log('3. ⚠️ Breaking change (MAJOR)');
  
  const versionChoice = await ask('\nEscolha (1-3): ');
  const versionType = versionChoice === '3' ? 'major' : versionChoice === '2' ? 'minor' : 'patch';
  const newVersion = incrementVersion(currentVersion, versionType);
  
  console.log(`\n🎯 Nova versão será: ${newVersion}\n`);
  
  // Coletar categorias
  const categories = {};
  
  console.log('Quais categorias você quer adicionar? (pressione Enter para pular)\n');
  
  for (const [emoji, {name, template}] of Object.entries(TEMPLATES)) {
    console.log(`\n${emoji} ${name}:`);
    console.log('Template:');
    console.log(template);
    
    const content = await ask('\nSeu conteúdo (ou Enter para pular): ');
    if (content.trim()) {
      categories[emoji] = content;
    }
  }
  
  // Gerar entrada
  if (Object.keys(categories).length === 0) {
    console.log('\n❌ Nenhuma categoria adicionada. Cancelando...');
    rl.close();
    return;
  }
  
  const entry = generateVersionEntry(newVersion, categories);
  
  console.log('\n📝 Entrada que será adicionada:');
  console.log('='.repeat(50));
  console.log(entry);
  console.log('='.repeat(50));
  
  const confirm = await ask('\nConfirmar adição? (y/N): ');
  
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    updateChangelog(entry);
    updatePackageVersion(newVersion);
    console.log('\n🎉 CHANGELOG atualizado com sucesso!');
    console.log(`\n📋 Próximos passos:`);
    console.log(`1. Revisar o CHANGELOG.md`);
    console.log(`2. git add CHANGELOG.md package.json`);
    console.log(`3. git commit -m "📋 Update CHANGELOG v${newVersion}"`);
  } else {
    console.log('\n❌ Operação cancelada.');
  }
  
  rl.close();
}

// Lidar com erros
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error.message);
  process.exit(1);
});

// Executar
main().catch(console.error);