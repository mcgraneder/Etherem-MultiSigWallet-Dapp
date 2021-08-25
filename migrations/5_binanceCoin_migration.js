const BinanceCoin = artifacts.require("BinanceCoin");

module.exports = function (deployer) {
  deployer.deploy(BinanceCoin);
};
