#!/usr/bin/env node

/**
 * MapLeads - PocketBase Automated Setup Script
 * 
 * This script automatically creates all required PocketBase collections
 * for the MapLeads application without user interaction.
 */

import fetch from 'node-fetch';
import fs from 'fs';

const PB_URL = 'http://127.0.0.1:8090';
const SCHEMA_FILE = 'pocketbase/pb_schema.json';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@mapleads.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin123456';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkPocketBaseHealth() {
  log('\n🔍 Checking PocketBase connection...', 'blue');
  try {
    const response = await fetch(`${PB_URL}/api/health`);
    const data = await response.json();
    
    if (data.code === 200) {
      log('✅ PocketBase is running and healthy\n', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Cannot connect to PocketBase. Make sure it\'s running on port 8090.', 'red');
    log(`   Error: ${error.message}\n`, 'red');
    return false;
  }
}

async function getAuthToken() {
  log('🔐 Admin Authentication', 'blue');
  log('─'.repeat(50), 'blue');
  log(`   Email: ${ADMIN_EMAIL}`, 'blue');
  
  // Try to login first
  try {
    const loginResponse = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      log('✅ Successfully authenticated as existing admin\n', 'green');
      return data.token;
    }
    
    // If login failed, try to create admin
    log('⚠️  Admin not found. Creating new admin account...', 'yellow');
    
    const createResponse = await fetch(`${PB_URL}/api/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passwordConfirm: ADMIN_PASSWORD
      })
    });
    
    if (createResponse.ok) {
      log('✅ Admin account created successfully', 'green');
      
      // Now login
      const retryLogin = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      
      if (retryLogin.ok) {
        const data = await retryLogin.json();
        log('✅ Successfully authenticated\n', 'green');
        return data.token;
      }
    } else {
      const errorText = await createResponse.text();
      log(`❌ Failed to create admin: ${errorText}`, 'red');
    }
  } catch (error) {
    log(`❌ Authentication error: ${error.message}`, 'red');
  }
  
  return null;
}

async function checkExistingCollections(authToken) {
  try {
    const response = await fetch(`${PB_URL}/api/collections`, {
      headers: { 'Authorization': authToken }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
  } catch (error) {
    log(`⚠️  Could not check existing collections: ${error.message}`, 'yellow');
  }
  return [];
}

async function createCollection(collection, authToken) {
  try {
    const response = await fetch(`${PB_URL}/api/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify(collection)
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setupCollections(authToken) {
  log('📦 Setting up PocketBase Collections', 'blue');
  log('─'.repeat(50), 'blue');
  
  // Read schema file
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
    log(`\n📋 Found ${schema.length} collections in schema file:`, 'blue');
    schema.forEach(col => log(`   • ${col.name} (${col.type})`, 'blue'));
  } catch (error) {
    log(`❌ Could not read schema file: ${error.message}`, 'red');
    return false;
  }
  
  // Check existing collections
  const existing = await checkExistingCollections(authToken);
  const existingNames = existing.map(c => c.name);
  
  if (existingNames.length > 0) {
    log(`\n⚠️  Found ${existingNames.length} existing collections: ${existingNames.join(', ')}`, 'yellow');
  }
  
  // Create collections
  log('\n🔨 Creating collections...\n', 'blue');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const collection of schema) {
    if (existingNames.includes(collection.name)) {
      log(`⏭️  ${collection.name.padEnd(20)} - Already exists, skipping`, 'yellow');
      skipCount++;
      continue;
    }
    
    const result = await createCollection(collection, authToken);
    
    if (result.success) {
      log(`✅ ${collection.name.padEnd(20)} - Created successfully`, 'green');
      successCount++;
    } else {
      log(`❌ ${collection.name.padEnd(20)} - Failed: ${JSON.stringify(result.error)}`, 'red');
      errorCount++;
    }
  }
  
  // Summary
  log('\n' + '─'.repeat(50), 'blue');
  log('📊 Summary:', 'bright');
  log(`   ✅ Created: ${successCount}`, successCount > 0 ? 'green' : 'reset');
  log(`   ⏭️  Skipped: ${skipCount}`, skipCount > 0 ? 'yellow' : 'reset');
  log(`   ❌ Errors:  ${errorCount}`, errorCount > 0 ? 'red' : 'reset');
  
  return errorCount === 0;
}

async function verifySetup(authToken) {
  log('\n✨ Verifying setup...', 'blue');
  
  const collections = await checkExistingCollections(authToken);
  const requiredCollections = ['users', 'searches', 'saved_searches', 'businesses'];
  const existing = collections.map(c => c.name);
  const missing = requiredCollections.filter(name => !existing.includes(name));
  
  if (missing.length === 0) {
    log('✅ All required collections exist!\n', 'green');
    log('📦 Collections:', 'blue');
    collections.forEach(col => {
      log(`   • ${col.name} (${col.type}) - ${col.schema?.length || 0} fields`, 'blue');
    });
    return true;
  } else {
    log(`⚠️  Missing collections: ${missing.join(', ')}`, 'yellow');
    return false;
  }
}

async function main() {
  log('╔═══════════════════════════════════════════════════╗', 'bright');
  log('║   MapLeads - PocketBase Automated Setup          ║', 'bright');
  log('╚═══════════════════════════════════════════════════╝', 'bright');
  
  // Step 1: Check PocketBase
  const isHealthy = await checkPocketBaseHealth();
  if (!isHealthy) {
    process.exit(1);
  }
  
  // Step 2: Authenticate
  const authToken = await getAuthToken();
  if (!authToken) {
    log('\n❌ Failed to authenticate. Setup cannot continue.\n', 'red');
    process.exit(1);
  }
  
  // Step 3: Setup collections
  const success = await setupCollections(authToken);
  
  // Step 4: Verify
  const verified = await verifySetup(authToken);
  
  if (verified) {
    log('\n✨ Setup complete! Your PocketBase database is ready.', 'green');
    log('🚀 You can now use the MapLeads application.\n', 'green');
    log('📝 Admin credentials:', 'blue');
    log(`   Email:    ${ADMIN_EMAIL}`, 'blue');
    log(`   Password: ${ADMIN_PASSWORD}\n`, 'blue');
  } else {
    log('\n⚠️  Setup completed with warnings. Please check the output above.\n', 'yellow');
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
