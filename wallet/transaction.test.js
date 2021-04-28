const Transactions = require("./transactions");
const Wallet = require("./index");
const { verifySignature } = require("../utils");
const { MINING_REWARD, REWARD_ADDRESS } = require("../config");
describe("Transactions", () => {
  let transactions, senderWallet, recipient, amount;
  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recpient-public-key";
    amount = 100;
    transactions = new Transactions({
      senderWallet,
      recipient,
      amount,
    });
  });
  it("has an`id`", () => {
    expect(transactions).toHaveProperty("id");
  });
  describe("outputMap", () => {
    it("has an `outputMap` property", () => {
      expect(transactions).toHaveProperty("outputMap");
    });
    it("outputs the amount to the recipient", () => {
      expect(transactions.outputMap[recipient]).toEqual(amount);
    });
    it("outputs the remaining balance for the`sender wallet`", () => {
      expect(transactions.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });
  describe("input", () => {
    it("has an `input`", () => {
      expect(transactions).toHaveProperty("input");
    });

    it("has a `timestamp` in the input", () => {
      expect(transactions.input).toHaveProperty("timestamp");
    });

    it("sets the `amount` to the `senderWallet` balance", () => {
      expect(transactions.input.amount).toEqual(senderWallet.balance);
    });

    it("sets the `address` to the `senderWallet` publicKey", () => {
      expect(transactions.input.address).toEqual(senderWallet.publicKey);
    });

    it("signs the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transactions.outputMap,
          signature: transactions.input.signature,
        })
      ).toBe(true);
    });
  });
  describe("validTransactions()", () => {
    describe("when the transaction is valid", () => {
      it("returns true", () => {
        expect(Transactions.validtransactions(transactions)).toBe(true);
      });
    });
    describe("when the transactions is invalid", () => {
      describe("when the transactions output value is invalid", () => {
        it("returns false", () => {
          transactions.outputMap[senderWallet.publicKey] = 99999;
          expect(Transactions.validtransactions(transactions)).toBe(false);
        });
      });
      describe("when the transactions input signature is invalid", () => {
        it("returns false", () => {
          transactions.input.signature = new Wallet().sign("foulData");
          expect(Transactions.validtransactions(transactions)).toBe(false);
        });
      });
    });
  });
  describe("update()", () => {
    let orginalSignature, originalSenderOutput, nextRecipient, nextAmount;
    describe("amount is invalid", () => {
      it("throw the error", () => {
        expect(() => {
          transactions.update({
            senderWallet,
            recipient: "poop",
            amount: 99999,
          });
        }).toThrow("Amount exceeds balance");
      });
    });

    describe("amount is valid", () => {
      beforeEach(() => {
        orginalSignature = transactions.input.signature;
        originalSenderOutput = transactions.outputMap[senderWallet.publicKey];
        nextRecipient = "nextone";
        nextAmount = 110;

        transactions.update({
          senderWallet,
          recipient: nextRecipient,
          amount: nextAmount,
        });
      });
      it("outputs the amount to the next recipient", () => {
        expect(transactions.outputMap[nextRecipient]).toEqual(nextAmount);
      });
      it("subtracts thr amount fromt the origina sender amount", () => {
        expect(transactions.outputMap[senderWallet.publicKey]).toEqual(
          originalSenderOutput - nextAmount
        );
      });
      it("maintain the total output amount that matches the input amount", () => {
        expect(
          Object.values(transactions.outputMap).reduce(
            (total, output) => total + output
          )
        ).toEqual(transactions.input.amount);
      });
      it("re-signs the transaction", () => {
        expect(transactions.input.signature).not.toEqual(orginalSignature);
      });
      describe("and another update for the same recipient", () => {
        let addedAmount;
        beforeEach(() => {
          addedAmount = 180;
          transactions.update({
            senderWallet,
            recipient: nextRecipient,
            amount: addedAmount,
          });
        });
        it("adds to the recipient amount", () => {
          expect(transactions.outputMap[nextRecipient]).toEqual(
            nextAmount + addedAmount
          );
        });
        it("subtracts the amount from the original sender output amount", () => {
          expect(transactions.outputMap[senderWallet.publicKey]).toEqual(
            originalSenderOutput - nextAmount - addedAmount
          );
        });
      });
    });
  });
  describe("rewardTransaction()", () => {
    let rewardTransaction, minerWallet;
    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transactions.rewardTransaction({ minerWallet });
    });
    it("creates atrasaction with reward input", () => {
      expect(rewardTransaction.input).toEqual(REWARD_ADDRESS);
    });
    it("creates one transaction for the miner with the `MINING_REWARD`", () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(
        MINING_REWARD
      );
    });
  });
});
