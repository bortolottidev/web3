require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.7.3",
    networks: {
        ropsten: {
          url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
          accounts: [`${ROPSTEN_PRIVATE_KEY}`]
        }
    }
};
