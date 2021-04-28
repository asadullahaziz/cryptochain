const Transactions = require("./transactions");
const Wallet = require("./index");
const Transactionpool = require("./transaction-pool.js");
const Blockchain = require("../blockchain");
describe("Transactionpool", () => {
  let transactionPool, transaction, senderWallet;
  beforeEach(() => {
    transactionPool = new Transactionpool();
    senderWallet = new Wallet();
    transaction = new Transactions({
      senderWallet,
      recipient: "a fake recipient",
      amount: 125,
    });
  });
  describe("setTransactions()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });
  describe("existingTransactions()", () => {
    it("returns an existing transactions given an input address", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(transaction);
    });
  });
  describe("validTransactions()", () => {
    let validtransactions;
    beforeEach(() => {
      validtransactions = [];
      for (let i = 0; i < 10; i++) {
        transaction = new Transactions({
          senderWallet,
          recipient: "annypoop",
          amount: 30,
        });
        if (i % 3 === 0) {
          transaction.input.amount = 99999;
        } else if (i % 3 === 1) {
          transaction.input.signature = new Wallet().sign("foo");
        } else {
          validtransactions.push(transaction);
        }
        transactionPool.setTransaction(transaction);
      }
    });
    it("returns valid transaction", () => {
      expect(transactionPool.validTransactions()).toEqual(validtransactions);
    });
  });
  describe("setMap", () => {
    it("sets transaction pool map", () => {
      const transactionMap = {
        "91ee01b0-a42d-11eb-9198-6fc750f42a5b": {
          id: "91ee01b0-a42d-11eb-9198-6fc750f42a5b",
          outputMap: {
            "a fake recipient": 125,
            "045178c592413377065228399843f4e69d8eb0901f3fa8789116f2db1afc147ca18bc3cd43d54df1afcb6eab37a983a89e22778c24086a695ce0b3f6d84804f829": 875,
          },
          input: {
            timestamp: 1619180119372,
            amount: 1000,
            address:
              "045178c592413377065228399843f4e69d8eb0901f3fa8789116f2db1afc147ca18bc3cd43d54df1afcb6eab37a983a89e22778c24086a695ce0b3f6d84804f829",
            signature: {
              r:
                "c1e9f075cf3ce1d4ba0dd5c943b3cd302ea3da5b13b0414f060b0ff3a3652d08",
              s:
                "a808aaab4eb4b1179efb9c9aa121c680f5b977e429397925068a57184b3b5c97",
              recoveryParam: 0,
            },
          },
        },
      };
      transactionPool.setMap(transactionMap);
      expect(transactionPool["transactionMap"]).toEqual(transactionMap);
    });
  });
  describe("clear()", () => {
    it("clears the transactions", () => {
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });
  describe("clearBlockchainTransactions()", () => {
    it("clears the pool of any existing blockchain transactions", () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};
      for (let i = 0; i < 6; i++) {
        const transaction = new Wallet().createTransactions({
          recipient: "foo",
          amount: 20,
        });
        transactionPool.setTransaction(transaction);
        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
        transactionPool.clearBlockchainTransactions({
          chain: blockchain.chain,
        });
        expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
      }
    });
  });
});
