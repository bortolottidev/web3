const Web3 = require("web3");

const PSOLIDSOLID_POOL_NAME = "PSOLID-SOLID-LP";

const {
  abi: ripaeBankAbi,
  address: ripaeBankAddress,
} = require("./contracts/ripae-ftm-bank.json");

const {
  abi: oracleAbi,
  address: oracleAddress,
} = require("./contracts/ripae-ftm-oracle.json");

const {
  address: oracleFtmUsdAddress,
  abi: oracleFtmUsdAbi,
} = require("./contracts/chainlink-oracle.json");

const {
  ftmAddress: paeFtmRewardPoolAddress,
  solidAddress: paeSolidRewardPoolAddress,
  abi: paeRewardPoolABI,
} = require("./contracts/pae-rewards-pool.json");

const {
  address: paePoolAddress,
  abi: paePoolABI,
} = require("./contracts/pae-lp-pool.json");

const {
  address: spookyAddress,
  abi: spookyABI,
} = require("./contracts/spooky-swap.json");

const rpcURL = process.env.RPC_URL;
const { eth: web3Client, utils } = new Web3(rpcURL);
const { Contract } = web3Client;

const formatAsFTM = (wei) => utils.fromWei(wei, "ether");
const formatAsWei = (ftm) => utils.toWei(ftm, "ether");

const formatChainlinkLatestPrice = (price) => price / 10 ** 8;
const invoke = (method, ...params) =>
  ripaeBank.methods[method](...params).call();

const myAddress = process.env.MY_ADDRESS;

const printBalance = async () => {
  const weiBalance = await web3Client.getBalance(myAddress);
  const balance = formatAsFTM(weiBalance);
  console.log(`Hey, your address has currently ${balance} FTM`);
  if (balance < (process.env.ALERT_MIN_FTM || 10)) {
    console.warn("Your FTM is low, pay attention to the fees!");
  }
};

const paeLpPool = new Contract(paePoolABI, paePoolAddress);
const ripaeBank = new Contract(ripaeBankAbi, ripaeBankAddress);
const ripaeOracle = new Contract(oracleAbi, oracleAddress);
const ftmUsdPriceFeed = new Contract(oracleFtmUsdAbi, oracleFtmUsdAddress);
const paeFtmRewardsPool = new Contract(
  paeRewardPoolABI,
  paeFtmRewardPoolAddress
);
const paeSolidRewardsPool = new Contract(
  paeRewardPoolABI,
  paeSolidRewardPoolAddress
);
const spookySwap = new Contract(spookyABI, spookyAddress);

const swap = {
  // v1 willl swap all available pae -> mim
  fromPaeToMim: async () => {
    const paeAddress = "0x8a41f13a4FaE75ca88B1ee726ee9D52B148b0498";
    const wftmAddress = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
    const mimAddress = "0x82f0B8B456c1A451378467398982d4834b6829c1";
    const btcAddress = "0x321162Cd933E2Be498Cd2267a90534A804051b11";

    //const path = [paeAddress, wftmAddress, btcAddress];
    const path = [paeAddress, wftmAddress, mimAddress];

    const ripaeContract = new Contract(ripaeBankAbi, paeAddress);
    const paeBalance = await ripaeContract.methods.balanceOf(myAddress).call();
    const unixTime = Math.floor(Date.now() / 1000);

    const amountOutMinsArray = await spookySwap.methods
      .getAmountsOut(
        paeBalance, // amount in
        path // swap pool chain (e.g. pae -> wftm -> mim)
      )
      .call();

    const amountOutMin = true
      ? amountOutMinsArray[amountOutMinsArray.length - 1]
      : utils.toWei(
          amountOutMinsArray[amountOutMinsArray.length - 1],
          "mwei" // requiredForBtc
        );

    const swapParams = {
      balance: paeBalance,
      path,
      amountOutMin,
      unixTime,
    };
    console.log("Swapping..", swapParams);

    // found required gas for swap
    const requiredGas = await spookySwap.methods
      .swapTokensForExactTokens(
        amountOutMin,
        paeBalance,
        path,
        myAddress,
        unixTime
      )
      .estimateGas({
        from: myAddress,
      });

    const encodedTransaction = spookySwap.methods
      .swapTokensForExactTokens(
        amountOutMin,
        paeBalance,
        path,
        myAddress,
        unixTime + 60 // will expire in 60 seconds
      )
      .encodeABI();

    const transactionObject = {
      gas: requiredGas,
      data: encodedTransaction,
      from: myAddress,
      to: spookyAddress,
    };

    const signedTx = await web3Client.accounts.signTransaction(
      transactionObject,
      process.env.SECRET_PRIVATE_KEY
    );

    const receipt = await web3Client.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log("swap correct", { swapParams, signedTx, receipt });
  },
};

const oracle = {
  getFtmUsdPrice: async () => {
    const { answer: latestPrice } = await ftmUsdPriceFeed.methods
      .latestRoundData()
      .call();

    return formatChainlinkLatestPrice(latestPrice);
  },
  getPaeUsdPrice: async () => {
    const paeLpReserve = await paeLpPool.methods["getReserves"]().call();
    const tokens = await Promise.all([
      paeLpPool.methods["token0"]().call(),
      paeLpPool.methods["token1"]().call(),
    ]);
    const paeAddress = await ripae.getPAEAddress();
    const paeIndex = tokens.findIndex((t) => t === paeAddress);
    console.assert(paeIndex !== -1, "Pae token not found");
    const ftmIndex = paeIndex === 1 ? 0 : 1;
    return (
      (Number(paeLpReserve[ftmIndex]) / paeLpReserve[paeIndex]) *
      (await oracle.getFtmUsdPrice())
    );
  },
  getPtokenTokenPrice: async () => {
    const pTokenAddress = await ripae.getPTokenAddress();
    const priceWei = await ripaeOracle.methods
      .consult(pTokenAddress, formatAsWei("1"))
      .call();
    return formatAsFTM(priceWei);
  },
};

const transactionCounter = async () => {
  return web3Client.getTransactionCount(myAddress);
};

const ripae = {
  getPaeInWallet: () => {
    const paeAddress = "0x8a41f13a4FaE75ca88B1ee726ee9D52B148b0498";

    const ripaeContract = new Contract(ripaeBankAbi, paeAddress);
    return ripaeContract.methods.balanceOf(myAddress).call();
  },
  getPaeTotalSupply: () => invoke("totalSupply"),
  getPTokenTotalSupply: async () => {
    const pTokenContract = new Contract(
      ripaeBankAbi,
      await ripae.getPTokenAddress()
    );
    return pTokenContract.methods["totalSupply"]().call();
  },
  getPaeIntoBank: async () => {
    const weiIntoBank = await invoke("balanceOf", myAddress);

    return formatAsFTM(weiIntoBank);
  },
  getPAEAddress: () => invoke("pae"),
  getPTokenAddress: () => invoke("pToken"),
  getPegPrice: async () => formatAsFTM(await invoke("getPegPrice")),
  getEarnedPTokenInBank: async () =>
    formatAsFTM(await invoke("earned", myAddress)),
  canWithdrawFromBank: () => invoke("canWithdraw", myAddress),
  getEarnedPaeFromPools: async () => {
    const pools = [
      { name: PSOLIDSOLID_POOL_NAME, pid: 1, contract: paeSolidRewardsPool },
      { name: "PFTM-FTM-LP", pid: 0 },
      { name: "BFTM", pid: 2 },
      { name: "PFTM", pid: 3 },
      { name: "RIP-OXD", pid: 4 },
    ];

    const pendingPAE = await Promise.all(
      pools.map(({ pid, contract }) =>
        (contract || paeFtmRewardsPool).methods["pendingPAE"](
          pid,
          myAddress
        ).call()
      )
    );

    const paeUsd = await oracle.getPaeUsdPrice();
    return pools.map(({ contract, ...config }, i) => ({
      ...config,
      pending: pendingPAE[i],
      earned: Number(formatAsFTM(pendingPAE[i])),
      earnedAsUsd: Number(formatAsFTM(pendingPAE[i])) * paeUsd,
    }));
  },
  withdrawFromPool: async ({ name, pid, earned, earnedAsUsd }, nonce) => {
    console.log("Withdrawing from pool...", {
      name,
      pid,
      earned,
      earnedAsUsd,
      nonce,
    });

    const rewardContract =
      name === PSOLIDSOLID_POOL_NAME ? paeSolidRewardsPool : paeFtmRewardsPool;
    const withdrawFunc = rewardContract.methods["withdraw"];

    // found required gas for withdraw
    const requiredGas = await withdrawFunc(pid, 0).estimateGas({
      from: myAddress,
    });

    //    return { status: "OK", earnedAsUsd, name, earned };
    // we want to get only rewards
    const encodedTransaction = withdrawFunc(pid, 0).encodeABI();

    const transactionObject = {
      gas: requiredGas,
      //      nonce,
      data: encodedTransaction,
      from: myAddress,
      to:
        name === PSOLIDSOLID_POOL_NAME
          ? paeSolidRewardPoolAddress
          : paeFtmRewardPoolAddress,
    };

    const gasPrice = await web3Client.getGasPrice();
    const formattedGas = formatAsFTM(
      new String(requiredGas * gasPrice).toString()
    );
    if (formattedGas > 0.1) {
      throw new Error("Gas too high, retry later!");
    }
    console.log("Transaction...", {
      ...transactionObject,
      gas: formattedGas,
    });

    const signedTx = await web3Client.accounts.signTransaction(
      transactionObject,
      process.env.SECRET_PRIVATE_KEY
    );
    const receipt = await web3Client.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log("withdraw correctly", { signedTx, receipt });
    return { status: "OK", earnedAsUsd, name, earned };
  },
};

module.exports = {
  printBalance,
  formatAsFTM,
  oracle,
  ripae,
  swap,
  transactionCounter,
};
