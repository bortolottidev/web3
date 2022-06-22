const { printBalance, oracle, ripae, swap, formatAsFTM } = require("./utils");

(async () => {
  await printBalance();

  const earnedPAE = (await ripae.getEarnedPaeFromPools()).filter(
    ({ earned }) => earned > 0.01
  );
  const myPaeIntoBank = await ripae.getPaeIntoBank();
  const paeWallet = await ripae.getPaeInWallet();
  const paePriceUsd = await oracle.getPaeUsdPrice();
  const withDrawalRequested = earnedPAE.filter(
    (e) => e.earnedAsUsd > process.env.REDEEMABLE_MIN_USD
  );

  //const withdrawalResults = await Promise.all(concurrentlyWithdrawFromPools);

  const res = new Array(withDrawalRequested.length);
  let index = 0;
  for (const earned of withDrawalRequested) {
    res[index++] = await ripae.withdrawFromPool(earned);
  }

  const reedimedPae = res
    .filter(({ status }) => status === "OK")
    .reduce((reedimedSum, { earned }) => reedimedSum + earned, 0);

  const totalPae =
    earnedPAE.reduce((sumAcc, { earned }) => sumAcc + Number(earned), 0) +
    Number(myPaeIntoBank);

  const earnedPToken = await ripae.getEarnedPTokenInBank();
  const pegPToken = await oracle.getPtokenTokenPrice();
  const ftmUsd = await oracle.getFtmUsdPrice();

  console.log({ paeTotal: paeWallet + reedimedPae });
  const paeReadyUsd = formatAsFTM(paeWallet + reedimedPae) * paePriceUsd;
  console.log({ paeReadyUsd });
  if (paeReadyUsd > (process.env.SWAPPABLE_MIN_USD || 10)) {
    console.log(`Swapping ${paeReadyUsd}$`);
    swap.fromPaeToMim();
  }

  console.log({
    paeWallet,
    paePriceUsd,
    earnedPAE,
    reedimedPae,
    totalPae,
    totalPaeUsd: totalPae * paePriceUsd,
    myPaeIntoBank,
    pegPToken,
    canWithdraw: await ripae.canWithdrawFromBank(),
    earned: {
      pftm: earnedPToken,
      usd: earnedPToken * pegPToken * ftmUsd,
    },
    totalSupplyPae: Number(await ripae.getPaeTotalSupply()).toLocaleString(
      "it-IT"
    ),
    totalSupplyPToken: Number(
      await ripae.getPTokenTotalSupply()
    ).toLocaleString("it-IT"),
  });
})().then(
  () => console.log("[OK]"),
  (error) => console.error(error)
);
