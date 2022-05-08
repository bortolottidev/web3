// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");

const printBalance = async (printMsg, address) => {
  // read balance
  const contractBalance = await hre.ethers.provider.getBalance(address);
  console.log(printMsg, hre.ethers.utils.formatEther(contractBalance));
};

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account: ", deployer.address);

  // We get the contract to deploy
  const coffeeFactoryContractFactory = await hre.ethers.getContractFactory(
    "CoffeeFactory"
  );
  const coffeeFactoryContract = await coffeeFactoryContractFactory.deploy({
    value: hre.ethers.utils.parseEther("10"),
  });

  await coffeeFactoryContract.deployed();

  console.log("CoffeeFactory deployed to:", coffeeFactoryContract.address);
  await printBalance(
    "Contract initial balance: ",
    coffeeFactoryContract.address
  );
  await printBalance("Deployer initial balance: ", deployer.address);

  // lets offer a coffee
  const cofeeTx = await coffeeFactoryContract.buyACoffee(
    "Your first coffee, enjoy!",
    "Daniele",
    { value: ethers.utils.parseEther("5") }
  );
  await cofeeTx.wait();

  /* await printBalance(
    "Contract updated balance: ",
    coffeeFactoryContract.address
  );
  await printBalance("Deployer updated balance: ", deployer.address); */

  // no need to withdraw
  // await coffeeFactoryContract.withdraw();

  // from here deployer will have back his 10 eth sent initially... but buyACoff doesnt work?
  const coffeeNumber = await coffeeFactoryContract.getAllCoffee();
  console.log("Offered coffessss: ", coffeeNumber);
  await printBalance("Contract last balance: ", coffeeFactoryContract.address);
  await printBalance("Deployer last balance: ", deployer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
