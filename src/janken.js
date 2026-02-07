const HANDS = ['グー', 'チョキ', 'パー'];

function getComputerHand(rng) {
  const idx = rng.nextInt(3);
  return HANDS[idx];
}

function judge(playerHand, computerHand) {
  if (playerHand === computerHand) return 'draw';
  // グー beats チョキ, チョキ beats パー, パー beats グー
  if (
    (playerHand === 'グー' && computerHand === 'チョキ') ||
    (playerHand === 'チョキ' && computerHand === 'パー') ||
    (playerHand === 'パー' && computerHand === 'グー')
  ) {
    return 'win';
  }
  return 'lose';
}

function createGameState() {
  return {};
}

function step(state, input, rng) {
  const playerHand = input;
  const computerHand = getComputerHand(rng);
  const result = judge(playerHand, computerHand);
  return { result, computerHand };
}

module.exports = { getComputerHand, judge, createGameState, step };
