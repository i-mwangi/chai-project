import { URL } from 'url';

// Test URL parsing
const testUrl = '/app.html?groveId=3&amount=35404';
const url = new URL(testUrl, 'http://localhost:3000');
console.log('Full URL:', url.toString());
console.log('Pathname:', url.pathname);
console.log('Search:', url.search);
console.log('Query params:', Object.fromEntries(url.searchParams));