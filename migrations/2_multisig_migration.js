const MultiSigWallet = artifacts.require("MultiSigWallet");

module.exports = function (deployer) {
  deployer.deploy(MultiSigWallet);
};
