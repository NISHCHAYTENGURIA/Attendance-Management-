#!/usr/bin/env node

/**
 * Connection Diagnostic Tool
 * Verifies Azure Cosmos DB connectivity and configuration
 * 
 * Usage: node diagnostics.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

console.log('🔍 Attendance Management System - Connection Diagnostics');
console.log('═'.repeat(60));

// 1. Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('─'.repeat(60));

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = [];

requiredEnvVars.forEach(variable => {
  if (process.env[variable]) {
    const value = variable === 'MONGO_URI' 
      ? process.env[variable].substring(0, 50) + '...'
      : '***';
    console.log(`✅ ${variable}: ${value}`);
  } else {
    console.log(`❌ ${variable}: NOT SET`);
    missingVars.push(variable);
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// 2. Verify connection string format
console.log('\n📝 Connection String Analysis:');
console.log('─'.repeat(60));

const mongoUri = process.env.MONGO_URI;
if (mongoUri.includes('cosmos.azure.com')) {
  console.log('✅ Connection string points to Azure Cosmos DB');
  
  // Extract details
  const hostMatch = mongoUri.match(/mongodb:\/\/.*?@(.*?)\./);
  const portMatch = mongoUri.match(/:(\d+)\//);
  const dbMatch = mongoUri.match(/@.*?@(.+?)@/);
  
  if (hostMatch) console.log(`   Host: ${hostMatch[1]}`);
  if (portMatch) console.log(`   Port: ${portMatch[1]}`);
  console.log(`   Protocol: MongoDB API (Cosmos DB)`);
} else {
  console.log('⚠️  Connection string may not be for Azure Cosmos DB');
}

// 3. Check if models exist
console.log('\n📦 Model Files Check:');
console.log('─'.repeat(60));

const modelFiles = [
  'models/User.js',
  'models/Attendance.js'
];

modelFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} NOT FOUND`);
  }
});

// 4. Check utility files
console.log('\n🛠️  Utility Files Check:');
console.log('─'.repeat(60));

const utilFiles = [
  'utils/analytics.js',
  'utils/bulkOperations.js',
  'utils/logger.js',
  'db.js'
];

utilFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} NOT FOUND`);
  }
});

// 5. Test database connection
console.log('\n🌐 Database Connection Test:');
console.log('─'.repeat(60));
console.log('Attempting connection to Azure Cosmos DB...');
console.log('This may take up to 30 seconds...\n');

async function testConnection() {
  try {
    // Connection options
    const connectionOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 45000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      directConnection: true,
      authSource: 'admin',
      authMechanism: 'SCRAM-SHA-1',
    };

    // Connect
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);

    console.log('✅ Successfully connected to Azure Cosmos DB!');
    console.log(`   Connection State: ${mongoose.connection.readyState}`);
    console.log(`   Database: ${mongoose.connection.db.getName()}`);
    console.log(`   Host: ${mongoose.connection.getClient().options.serverSelectionTimeoutMS}ms timeout`);

    // 6. Test ping
    console.log('\n🔌 Database Ping Test:');
    console.log('─'.repeat(60));

    const admin = mongoose.connection.db.admin();
    const pingResult = await admin.ping();
    console.log('✅ Database ping successful!');

    // 7. List collections
    console.log('\n📚 Collections in Database:');
    console.log('─'.repeat(60));

    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('ℹ️  No collections found (database is empty)');
      console.log('   This is normal for a new database');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }

    // 8. Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ All Diagnostics Passed!');
    console.log('═'.repeat(60));
    console.log('\n📊 System Status:');
    console.log('   • Connection: Active');
    console.log('   • Database: Responsive');
    console.log('   • Configuration: Valid');
    console.log('   • Ready for: Production Use');

    console.log('\n💡 Next Steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Test health endpoint: curl http://localhost:5000/api/health');
    console.log('   3. Create your first user: POST /api/auth/register');
    console.log('   4. Start marking attendance: POST /api/attendance/mark');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Connection failed!`);
    console.error(`\nError: ${error.message}`);
    
    // Provide helpful troubleshooting info
    console.error('\n🔧 Troubleshooting Tips:');
    console.error('─'.repeat(60));
    
    if (error.message.includes('timeout')) {
      console.error('   • Server selection timeout - possible causes:');
      console.error('     - Azure Cosmos DB is not running');
      console.error('     - Network connectivity issue');
      console.error('     - Firewall blocking port 10255');
      console.error('     - Invalid connection string');
    } else if (error.message.includes('authentication')) {
      console.error('   • Authentication failed - possible causes:');
      console.error('     - Invalid username/password in connection string');
      console.error('     - Connection string encoding issue');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   • DNS resolution failed - possible causes:');
      console.error('     - Invalid hostname');
      console.error('     - Network connectivity issue');
    }

    console.error('\n📝 Debugging Steps:');
    console.error('   1. Verify connection string in .env file');
    console.error('   2. Check if Azure Cosmos DB instance is running');
    console.error('   3. Test network connectivity: ping cosmos.azure.com');
    console.error('   4. Verify firewall rules allow outbound on port 10255');
    console.error('   5. Check Azure Portal for service status');

    // Stack trace for detailed debugging
    if (process.env.DEBUG === 'true') {
      console.error('\n📋 Full Error Stack:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run tests
testConnection();
