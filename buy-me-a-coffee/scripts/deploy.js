const deploy = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();
  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Start balance: ", hre.ethers.utils.formatEther(accountBalance));
  const CoffeeFactory = await hre.ethers.getContractFactory("CoffeeFactory");
  const bar = await CoffeeFactory.deploy({
    value: hre.ethers.utils.parseEther("0"),
  });
  await bar.deployed();

  console.log("Bar address: ", bar.address);
};

(async () => {
  try {
    await deploy();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
