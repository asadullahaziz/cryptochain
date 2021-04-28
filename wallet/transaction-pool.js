const Transactions = require("./transactions");
class Transactionpool {
  constructor() {
    this.transactionMap = {};
  }
  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }
  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }
  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(
      (transaction) => transaction.input.address === inputAddress
    );
  }
  validTransactions() {
    return Object.values(this.transactionMap).filter((transaction) =>
      Transactions.validtransactions(transaction)
    );
  }
  clear() {
    this.setMap({});
  }
  clearBlockchainTransactions({ chain }) {
    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}
module.exports = Transactionpool;
