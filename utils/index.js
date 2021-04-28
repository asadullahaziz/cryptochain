const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const cryptoHash = require("../utils/cryptoHash");

const verifySignature = ({ signature, data, publicKey }) => {
  var keyFromPublic = ec.keyFromPublic(publicKey, "hex");
  const msghash = cryptoHash(data);
  return keyFromPublic.verify(msghash, signature);
};
module.exports = { ec, verifySignature };
