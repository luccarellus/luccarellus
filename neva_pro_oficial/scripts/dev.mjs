import { spawn } from 'node:child_process';

function startProcess(label, args, options = {}) {
  const child = spawn('npm', args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
    ...options,
  });

  child.on('exit', (code, signal) => {
    if (code === 0 || signal) return;
    console.error(`\n[${label}] exited with code ${code}. Shutting down the other process...`);
    shutdown();
    process.exit(code || 1);
  });

  return child;
}

const frontend = startProcess('frontend', ['run', 'dev', '--prefix', 'frontend']);
const backend = startProcess('backend', ['run', 'start:dev', '--prefix', 'backend']);

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const proc of [frontend, backend]) {
    if (proc && !proc.killed) {
      proc.kill('SIGINT');
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
