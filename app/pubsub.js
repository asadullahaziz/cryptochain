const PubNub = require("pubnub");

require("dotenv").config();

const credentials = {
  publishKey: process.env.PUBLISHKEY,
  subscribeKey: process.env.SUBSCRIBEKEY,
  secretKey: process.env.SECRETKEY,
};
const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.wallet = wallet;
    this.transactionPool = transactionPool;
    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    });
    this.pubnub.addListener(this.listener());
  }
  listener() {
    return {
      message: (msgObj) => {
        const { channel, message } = msgObj;
        console.log(`SUCEESSfully conncected to ${channel} channel`, channel);
        console.table(`message------------------${message}`);
        const parsedMessage = JSON.parse(message);
        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMessage,
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (
              !this.transactionPool.existingTransaction({
                inputAddress: this.wallet.publicKey,
              })
            ) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            break;
        }
      },
    };
  }
  subscribeToChannel() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    });
  }
  publish({ channel, message }) {
    this.pubnub
      .publish({ channel, message })
      .then(() => console.log("sucessful"))
      .catch((err) => console.error(err));
  }
  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;
