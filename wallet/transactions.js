const { v1: uuidv1 } = require("uuid");
const { verifySignature } = require("../utils");
const { MINING_REWARD, REWARD_ADDRESS } = require("../config");

class Transactions {
  constructor({ senderWallet, recipient, amount, input, outputMap }) {
    this.id = uuidv1();
    this.outputMap =
      outputMap ||
      this.createOutputMap({
        senderWallet,
        recipient,
        amount,
      });
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }
  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = parseInt(amount, 10);
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }
  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }
  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds balance");
    }
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = parseInt(amount, 10);
    } else {
      this.outputMap[recipient] =
        this.outputMap[recipient] + parseInt(amount, 10);
    }
    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }
  static validtransactions(transaction) {
    const { input, outputMap } = transaction;
    const { amount, address, signature } = input;
    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmt) => total + outputAmt
    );
    if (amount !== outputTotal) {
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      return false;
    }
    return true;
  }
  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_ADDRESS,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}
module.exports = Transactions;
