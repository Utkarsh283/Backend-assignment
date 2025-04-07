// user_test.js — Tests for user management routes with auto-admin creation
const axios = require('axios').default;
const baseURL = 'http://localhost:5000';

const client = axios.create({
  baseURL,
  withCredentials: true
});

let accessToken = '';
let cookie = '';
let createdUserId = '';
const adminCredentials = {
  username: 'admin',
  fullname: 'Administrator',
  email: 'admin@example.com',
  password: 'adminpass',
  role: 'admin' // Include role for auto-signup
};

async function createAndLoginAdmin() {
  console.log('\n🔹 ADMIN SETUP');
  try {
    await client.post('/api/auth/signup', adminCredentials);
    console.log('✅ Admin signed up');
  } catch (err) {
    console.log('ℹ️ Admin signup skipped:', err.response?.data?.message || 'May already exist');
  }

  try {
    const res = await client.post('/api/auth/login', {
      email: adminCredentials.email,
      password: adminCredentials.password
    });
    accessToken = res.data.accessToken;
    cookie = res.headers['set-cookie']?.find(c => c.startsWith('jwt='));
    console.log('✅ Admin login successful');
  } catch (err) {
    console.log('❌ Admin login failed:', err.response?.data?.message || err.message);
  }
}

async function testCreateUser() {
  console.log('\n🔹 CREATE USER (admin)');
  try {
    const res = await client.post('/api/users', {
      username: 'newuser',
      fullname: 'New User',
      email: 'newuser@example.com',
      password: 'newpass123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    createdUserId = res.data.user.id;
    console.log('✅ User created:', res.data.user.email);
  } catch (err) {
    console.log('❌ Create User failed:', err.response?.data?.message || err.message);
  }
}

async function testGetAllUsers() {
  console.log('\n🔹 GET ALL USERS (admin)');
  try {
    const res = await client.get('/api/users', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`✅ Retrieved ${res.data.length} users`);
  } catch (err) {
    console.log('❌ Get all users failed:', err.response?.data?.message || err.message);
  }
}

async function testGetUserById() {
  console.log('\n🔹 GET USER BY ID (admin)');
  try {
    const res = await client.get(`/api/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`✅ Get user by ID:`, res.data.email);
  } catch (err) {
    console.log('❌ Get user by ID failed:', err.response?.data?.message || err.message);
  }
}

async function testUpdateUser() {
  console.log('\n🔹 UPDATE USER (admin)');
  try {
    const res = await client.put(`/api/users/${createdUserId}`, {
      fullname: 'Updated User',
      role: 'admin'
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`✅ User updated:`, res.data.user.fullname, '| Role:', res.data.user.role);
  } catch (err) {
    console.log('❌ Update user failed:', err.response?.data?.message || err.message);
  }
}

async function testDeleteUser() {
  console.log('\n🔹 DELETE USER (admin)');
  try {
    await client.delete(`/api/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ User deleted');
  } catch (err) {
    console.log('❌ Delete user failed:', err.response?.data?.message || err.message);
  }
}

async function runUserTests() {
  console.log('🚀 Starting User Routes Tests...');
  await createAndLoginAdmin();
  if (!accessToken) {
    console.log('❌ Cannot proceed without valid access token.');
    return;
  }
  await testCreateUser();
  await testGetAllUsers();
  await testGetUserById();
  await testUpdateUser();
  await testDeleteUser();
  console.log('\n🎉 User route tests completed.');
}

runUserTests();

