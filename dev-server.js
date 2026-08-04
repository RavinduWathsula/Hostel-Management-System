const { spawn, execSync } = require('child_process');

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr LISTENING`).toString();
      const lines = out.split('\n');
      for (const line of lines) {
        if (line.includes(`:${port} `) || line.includes(`:${port}\t`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parseInt(parts[parts.length - 1], 10);
          if (pid && !isNaN(pid) && pid > 4) {
            try { execSync(`taskkill /F /PID ${pid}`); } catch (e) {}
          }
        }
      }
    }
  } catch (e) {}
}

freePort(5000);
freePort(3000);

console.log('🚀 Launching Aegis Hostel Management System...');
console.log('1️⃣ Starting Express API & MySQL Connection Server (Port 5000)...');
const server = spawn('npx', ['nodemon', 'server.js'], { stdio: 'inherit', shell: true });

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
