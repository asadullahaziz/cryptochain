const cryptoHash = require("./cryptoHash.js");
describe("cryptoHash()", () => {
  it("generates A SHA-256", () => {
    expect(cryptoHash("foo")).toEqual(
      "b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b"
    );
  });
  it("produce the same hash", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(
      cryptoHash("three", "one", "two")
    );
  });
});
