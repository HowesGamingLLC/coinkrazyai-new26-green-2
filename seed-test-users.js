#!/usr/bin/env node

const port = process.env.PORT || 8080;
const baseUrl = `http://localhost:${port}`;

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = new URL(endpoint, baseUrl);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return response.json();
}

async function main() {
  try {
    console.log('🔍 Checking existing test users...');
    const checkResult = await makeRequest(`${baseUrl}/api/auth/debug/check-users`);
    
    if (checkResult.success) {
      const missingUsers = checkResult.testUsersAvailable.filter(u => !u.found).length;
      console.log(`✅ Database check complete. Missing users: ${missingUsers}`);
      
      if (missingUsers > 0) {
        console.log('\n🌱 Seeding test users...');
        const reseedResult = await makeRequest(`${baseUrl}/api/auth/debug/reseed-users`, 'POST');
        
        if (reseedResult.success) {
          console.log('✅ Test users seeded successfully!');
          console.log(`📊 ${reseedResult.message}`);
          console.log(`\n🔐 Test Credentials:`);
          console.log(`   Username: ${reseedResult.testCredentials.username}`);
          console.log(`   Password: ${reseedResult.testCredentials.password}`);
        } else {
          console.error('❌ Failed to seed users:', reseedResult.error);
          process.exit(1);
        }
      } else {
        console.log('✅ All test users already exist!');
      }
    } else {
      console.error('❌ Failed to check users:', checkResult.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
