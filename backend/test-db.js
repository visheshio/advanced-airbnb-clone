/**
 * Quick test script to verify MongoDB connectivity and run API tests
 */
const dns = require('dns');

// Force Google DNS for SRV record resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...');
  console.log(`📡 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`\n✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);

    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`\n📂 Collections in database "${conn.connection.name}":`);
    if (collections.length === 0) {
      console.log('   (No collections yet — fresh database)');
    } else {
      for (const col of collections) {
        const count = await conn.connection.db.collection(col.name).countDocuments();
        console.log(`   • ${col.name} — ${count} document(s)`);
      }
    }

    // Test write operation
    console.log('\n🔄 Testing write operation...');
    const testCollection = conn.connection.db.collection('_connection_test');
    const testDoc = {
      message: 'Connection test',
      timestamp: new Date(),
      source: 'test-db.js',
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Write test passed! Inserted doc ID: ${insertResult.insertedId}`);

    // Test read operation
    console.log('🔄 Testing read operation...');
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`✅ Read test passed! Retrieved: "${readDoc.message}" at ${readDoc.timestamp}`);

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    await testCollection.drop().catch(() => {}); // Drop test collection
    console.log('🧹 Test data cleaned up');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL DATABASE TESTS PASSED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error(`\n❌ MongoDB Connection FAILED!`);
    console.error(`   Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   Hint: DNS resolution failed. Check network or whitelist IP in MongoDB Atlas.');
    }
    if (error.message.includes('authentication')) {
      console.error('   Hint: Check your username and password in MONGODB_URI.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();
