#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Migrating from Static Export to Full Next.js SSR\n');

const changes = [];

// Check and update next.config
const nextConfigFiles = ['next.config.ts', 'next.config.js', 'next.config.mjs'];
let configFile = null;

for (const file of nextConfigFiles) {
  if (fs.existsSync(file)) {
    configFile = file;
    break;
  }
}

if (configFile) {
  console.log(`📝 Found ${configFile}`);
  const content = fs.readFileSync(configFile, 'utf-8');
  
  if (content.includes("output: 'export'")) {
    console.log('⚠️  WARNING: Found "output: export" in config');
    console.log('   → You need to REMOVE this line for SSR to work');
    changes.push('Remove "output: export" from ' + configFile);
  }
  
  if (content.includes("distDir: 'out'")) {
    console.log('⚠️  WARNING: Found "distDir: out" in config');
    console.log('   → You need to REMOVE this line');
    changes.push('Remove "distDir: out" from ' + configFile);
  }
  
  if (content.includes('loader: \'custom\'') || content.includes('loaderFile')) {
    console.log('⚠️  WARNING: Found custom image loader');
    console.log('   → You should REMOVE custom image loader for SSR');
    changes.push('Remove custom image loader from ' + configFile);
  }
  
  console.log('');
}

// Check for image-loader.ts
if (fs.existsSync('image-loader.ts')) {
  console.log('📝 Found image-loader.ts');
  console.log('   → This file is NOT needed for SSR');
  changes.push('Delete image-loader.ts');
  console.log('');
}

// Check for .htaccess
if (fs.existsSync('.htaccess')) {
  console.log('📝 Found .htaccess');
  console.log('   → This file is NOT needed for Node.js deployment');
  changes.push('Delete .htaccess (only needed for static Apache hosting)');
  console.log('');
}

// Check package.json
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  console.log('📝 Checking package.json scripts:');
  
  if (pkg.scripts && pkg.scripts.start) {
    if (pkg.scripts.start.includes('$PORT')) {
      console.log('   ✅ Start script uses $PORT (good for Hostinger)');
    } else if (pkg.scripts.start === 'next start') {
      console.log('   ⚠️  Start script should use: next start -p $PORT');
      changes.push('Update start script to: "next start -p $PORT"');
    }
  } else {
    console.log('   ❌ No start script found!');
    changes.push('Add start script: "start": "next start -p $PORT"');
  }
  console.log('');
}

// Check for out directory
if (fs.existsSync('out')) {
  console.log('📁 Found out/ directory');
  console.log('   → This is from static export, safe to delete');
  changes.push('Delete out/ directory (will use .next instead)');
  console.log('');
}

// Summary
console.log('='.repeat(60));
console.log('📋 MIGRATION CHECKLIST:');
console.log('='.repeat(60));

if (changes.length > 0) {
  console.log('\n⚠️  Required Changes:\n');
  changes.forEach((change, i) => {
    console.log(`${i + 1}. ${change}`);
  });
  
  console.log('\n📝 After making these changes:');
  console.log('   1. rm -rf .next out');
  console.log('   2. npm run build');
  console.log('   3. npm start (test locally)');
  console.log('   4. git push (deploy to Hostinger)');
} else {
  console.log('\n✅ No issues found! Your project is ready for SSR deployment.');
  console.log('\nNext steps:');
  console.log('   1. git push origin main');
  console.log('   2. Deploy on Hostinger with:');
  console.log('      - Build command: npm run build');
  console.log('      - Start command: npm start');
  console.log('      - Node version: 18.x or 20.x');
}

console.log('\n' + '='.repeat(60));
console.log('💡 TIP: Full guide available in HOSTINGER-CLOUD-SSR-GUIDE.md');
console.log('='.repeat(60) + '\n');