#!/usr/bin/env node

/**
 * Script to automatically create Firestore indexes
 * Run with: node scripts/setup-firestore-indexes.js
 */

const { exec } = require('child_process');
const path = require('path');

const projectId = 'vireiestatistica-ba7c5';
const indexesFile = path.join(__dirname, '..', 'firestore.indexes.json');

console.log('🔥 Setting up Firestore indexes...');
console.log(`📁 Project: ${projectId}`);
console.log(`📄 Indexes file: ${indexesFile}`);

// Deploy indexes using Firebase CLI
const command = `firebase deploy --only firestore:indexes --project ${projectId}`;

console.log(`🚀 Running: ${command}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error deploying indexes:', error);
    console.error('stderr:', stderr);
    
    // Provide manual instructions
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log(`2. Select project: ${projectId}`);
    console.log('3. Go to Firestore Database > Indexes');
    console.log('4. Create the following composite indexes:');
    console.log('');
    console.log('   Index 1 - gameProgress collection:');
    console.log('   - userId (Ascending)');
    console.log('   - createdAt (Descending)');
    console.log('');
    console.log('   Index 2 - gameProgress collection:');
    console.log('   - userId (Ascending)');
    console.log('   - gameId (Ascending)');
    console.log('   - createdAt (Descending)');
    console.log('');
    console.log('   Or use this direct link:');
    console.log('   https://console.firebase.google.com/v1/r/project/vireiestatistica-ba7c5/firestore/indexes');
    
    process.exit(1);
  }

  console.log('✅ Indexes deployed successfully!');
  console.log('stdout:', stdout);
  
  if (stderr) {
    console.log('stderr:', stderr);
  }
});
