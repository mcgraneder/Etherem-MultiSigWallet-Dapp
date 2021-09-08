const MultiSigFactory = artifacts.require("MultiSigFactory");

module.exports = function (deployer) {
  deployer.deploy(MultiSigFactory);

};
