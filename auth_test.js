
// test.js (Comprehensive)
const axios = require('axios').default;
const baseURL = 'http://localhost:5000';

const client = axios.create({
  baseURL,
  withCredentials: true
});

let accessToken = '';
let cookie = '';

const users = Array.from({ length: 10 }, (_, i) => ({
  username: `user${i}`,
  fullname: `User ${i}`,
  email: `user${i}@example.com`,
  password: `pass${i}123`
}));

async function testSignup() {
  console.log('\n🔹 SIGNUP TESTS');
  for (let user of users) {
    try {
      const res = await client.post('/api/auth/signup', user);
      console.log(`✅ Signup [${user.email}] →`, res.data.message);
    } catch (err) {
      console.log(`⚠️ Signup [${user.email}] →`, err.response?.data?.message || err.message);
    }
  }
}

async function testLogin() {
  console.log('\n🔹 LOGIN TESTS');
  for (let user of users) {
    try {
      const res = await client.post('/api/auth/login', {
        email: user.email,
        password: user.password
      });
      accessToken = res.data.accessToken;
      cookie = res.headers['set-cookie']?.find(c => c.startsWith('jwt='));
      console.log(`✅ Login [${user.email}] → Token OK`);
    } catch (err) {
      console.log(`❌ Login [${user.email}] →`, err.response?.data?.message || err.message);
    }
  }
}

async function testProfile() {
  console.log('\n🔹 PROFILE TESTS');
  for (let i = 0; i < 10; i++) {
    try {
      const res = await client.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log(`✅ Profile ${i + 1} →`, res.data.email);
    } catch (err) {
      console.log(`❌ Profile ${i + 1} →`, err.response?.data?.message || err.message);
    }
  }
}

async function testRefresh() {
  console.log('\\n🔹 REFRESH TOKEN TESTS');
  for (let i = 0; i < 10; i++) {
    try {
      const res = await axios.post(`${baseURL}/api/auth/refresh`, {}, {
        headers: { Cookie: cookie },
        withCredentials: true
      });

      // Update accessToken and cookie for the next loop
      accessToken = res.data.accessToken;
      const newCookie = res.headers['set-cookie']?.find(c => c.startsWith('jwt='));
      if (newCookie) cookie = newCookie;

      console.log(`✅ Refresh ${i + 1} → New token received`);
    } catch (err) {
      console.log(`❌ Refresh ${i + 1} →`, err.response?.data?.message || err.message);
    }
  }
}


async function testLogout() {
  console.log('\n🔹 LOGOUT TESTS');
  for (let i = 0; i < 10; i++) {
    try {
      await axios.post(`${baseURL}/api/auth/logout`, {}, {
        headers: { Cookie: cookie },
        withCredentials: true
      });
      console.log(`✅ Logout ${i + 1} → Success`);
    } catch (err) {
      console.log(`❌ Logout ${i + 1} →`, err.response?.data?.message || err.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive API Tests...');
  await testSignup();
  await testLogin();
  await testProfile();
  await testRefresh();
  await testLogout();
  console.log('\n🎉 All test cases completed.');
}

runTests();
