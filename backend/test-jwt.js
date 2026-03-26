require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('MEMBER_JWT_SECRET:', process.env.MEMBER_JWT_SECRET ? 'Set' : 'Not set');

const MEMBER_JWT_SECRET = process.env.MEMBER_JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret';
console.log('\nJWT Secret used:', MEMBER_JWT_SECRET.substring(0, 20) + '...');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6IjMzNTEyYmNhLTM2ZDItNDExNS04NDFiLTA3ZWZmNjg2OTBhIiwicm9sZSI6Ik1FTUJFUiIsInR5cGUiOiJtZW1iZXIiLCJpYXQiOjE3NzQ1MDYyMzQsImV4cCI6MTc3NTExMTAzNH0.0J8tI5Xxz5KLTmZMpWwI_pYb1n0U_J2vG5L4H8KQvZo';

try {
  const decoded = jwt.verify(token, MEMBER_JWT_SECRET);
  console.log('Token verified successfully!');
  console.log('Decoded:', decoded);
} catch (err) {
  console.error('Token verification failed:', err.message);
}
