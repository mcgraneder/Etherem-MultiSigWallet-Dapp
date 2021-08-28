const UniSwap = artifacts.require("UniSwap");

module.exports = function (deployer) {
  deployer.deploy(UniSwap);

};
