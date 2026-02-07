const { getComputerHand, judge, createGameState, step } = require('../src/janken');

const mockRng = (value) => ({ nextInt: () => value });

test("judge: グー vs チョキ -> win", () => {
  expect(judge('グー', 'チョキ')).toBe('win');
});

test('getComputerHand with mocked rng', () => {
  const rng = mockRng(2); // 2 -> パー
  expect(getComputerHand(rng)).toBe('パー');
});

test('step returns result and computerHand', () => {
  const state = createGameState();
  const rng = mockRng(1); // 1 -> チョキ
  const out = step(state, 'グー', rng);
  expect(out).toHaveProperty('result');
  expect(out).toHaveProperty('computerHand');
  expect(out.computerHand).toBe('チョキ');
  expect(out.result).toBe('win');
});
