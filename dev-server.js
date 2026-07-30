const { spawn } = require('child_process');

console.log('🚀 Launching Aegis Hostel Management System...');
console.log('1️⃣ Starting Express API & MySQL Connection Server (Port 5000)...');
const server = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });

console.log('2️⃣ Starting Vite React Frontend Dev Server (Port 3000)...');
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  server.kill('SIGINT');
  vite.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  vite.kill('SIGTERM');
  process.exit();
});
