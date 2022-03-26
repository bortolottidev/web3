const {ethers} = require("hardhat");
const fs = require("fs");

async function main () {
    if (network.name === "hardhat") {
        console.warn(
          "You are trying to deploy a contract to the Hardhat Network, which" +
            "gets automatically created and destroyed every time. Use the Hardhat" +
            " option '--network localhost'"
        );
    } else {
        console.warn("WOw, not the fake network! Stay hungry!");
    }

    const [ deployer ] = await ethers.getSigners();
    console.log("Deploying with the account: ", deployer.address);
    const balance = await deployer.getBalance();
    console.log("Account balance before deploy: ", balance.toString());

    const Token = await ethers.getContractFactory("DanieleToken");
    const token = await Token.deploy();

    console.log("DanieleToken deployed at address: ", token.address);

    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(token);
}

// Crazy copy pasted 
function saveFrontendFiles(token) {
    const contractsDir = __dirname + "/../frontend/src/contracts";
    console.log('Saving contract in directory: ', contractsDir);
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    // save contract address
    fs.writeFileSync(
      contractsDir + "/contract-address.json",
      JSON.stringify({ DanieleToken: token.address }, undefined, 2)
    );
  
    // ?? black magic
    const TokenArtifact = artifacts.readArtifactSync("DanieleToken");
  
    // save contract 
    fs.writeFileSync(
      contractsDir + "/DanieleToken.json",
      JSON.stringify(TokenArtifact, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
