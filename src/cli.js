const readline = require('readline');
const { createRng } = require('./rng');
const { createGameState, step } = require('./janken');

async function runCli(argv = [], options = {}) {
  const stdin = options.stdin || process.stdin;
  const stdout = options.stdout || process.stdout;

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    terminal: typeof options.terminal === 'boolean' ? options.terminal : Boolean(stdin.isTTY),
  });
  const rng = options.rng || createRng();
  const state = createGameState();

  stdout.write('ジャンケンを始めます (入力: グー/チョキ/パー, qで終了)\n');

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (trimmed === 'q') {
        stdout.write('終了します\n');
        rl.close();
        resolve();
        return;
      }
      if (!['グー', 'チョキ', 'パー'].includes(trimmed)) {
        stdout.write('入力が不正です。グー/チョキ/パー のいずれかを入力してください\n');
        return;
      }
      const { result, computerHand } = step(state, trimmed, rng);
      let message = `あなた: ${trimmed} コンピュータ: ${computerHand} -> `;
      if (result === 'win') message += 'あなたの勝ちです';
      else if (result === 'lose') message += 'あなたの負けです';
      else message += '引き分けです';
      stdout.write(message + '\n');
    });
  });
}

module.exports = { runCli };
