const Transactions = require("../wallet/transactions");
class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }
  mineTranaction() {
    // get valid transaction
    const validTransactions = this.transactionPool.validTransactions();

    // genertae miner reward
    validTransactions.push(
      Transactions.rewardTransaction({
        minerWallet: this.wallet,
      })
    );
    //add block consisting of these transaction to the blockchain
    this.blockchain.addBlock({ data: validTransactions });
    //broadcast the updated blockchain
    this.pubsub.broadcastChain();
    //clear the pool
    this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;
