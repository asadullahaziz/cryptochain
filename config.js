const MINE_RATE = 3000;
const INITIAL_DIFFICULTY = 3;
const GENESIS_DATA = {
  timestamp: 1,
  lastHash: "-----",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};
const STARTING_BALANCE = 1000;
const REWARD_ADDRESS = { address: "*authorised-reward*" };
const MINING_REWARD = 50;
module.exports = {
  MINING_REWARD,
  REWARD_ADDRESS,
  GENESIS_DATA,
  MINE_RATE,
  STARTING_BALANCE,
};
