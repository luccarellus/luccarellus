const { execSync } = require('child_process');

const port = Number(process.argv[2] || 3333);

function killWindowsPort(targetPort) {
  try {
    const output = execSync(`netstat -ano -p tcp | findstr :${targetPort}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: 'cmd.exe',
    });

    const pids = new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(/\s+/);
          return parts[parts.length - 1];
        })
        .filter((pid) => /^\d+$/.test(pid)),
    );

    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, {
        stdio: 'ignore',
        shell: 'cmd.exe',
      });
    }
  } catch {
    // Ignore if the port is already free.
  }
}

function killUnixPort(targetPort) {
  try {
    // Using lsof to find PIDs and kill to terminate them.
    execSync(`lsof -t -i:${targetPort} | xargs -r kill -9`, {
      stdio: 'ignore',
      shell: '/bin/bash',
    });
  } catch {
    // Ignore if the port is already free.
  }
}

if (process.platform === 'win32') {
  killWindowsPort(port);
} else {
  killUnixPort(port);
}
