import { spawn } from 'node:child_process';

const commands = [
  ['api', ['--env-file-if-exists=.env.local', 'node_modules/tsx/dist/cli.mjs', 'watch', 'api/server.ts']],
  ['web', ['node_modules/next/dist/bin/next', 'dev', '-p', '3000']],
];

const children = commands.map(([name, args]) => {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
  child.on('exit', code => {
    if (code && code !== 0) console.error(`${name} exited with code ${code}`);
  });
  return child;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const child of children) child.kill(signal);
    process.exit(0);
  });
}
