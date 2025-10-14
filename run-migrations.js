const { spawn } = require('child_process');

// Run the migration CLI directly
const child = spawn('npx', ['tsx', 'db/migration-cli.ts', 'run'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`Migration process exited with code ${code}`);
});