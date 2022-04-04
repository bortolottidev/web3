const Adoption = artifacts.require("Adoption");

module.exports = function (utility) {
  utility.deploy(Adoption);
};
