const Migrations = artifacts.require("Migrations");

module.exports = function (deployer, accounts) {
  deployer.deploy(Migrations);
  console.log(accounts)
};
