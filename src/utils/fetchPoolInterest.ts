import { Vaults } from "esm";
import { constants, BigNumber } from "ethers";
import { stringUsdFormatter } from "utils/bigUtils";

export const fetchPoolInterestEarned = async (rari: Vaults, address: string) => {
  const [
    stableInterest,
    yieldInterest,
    daiInterest,
    ethInterestInETH,
    ethPriceBigNumber,
  ] = await Promise.all([
    rari.pools.stable.balances.interestAccruedBy(address),
    rari.pools.yield.balances.interestAccruedBy(address),
    rari.pools.dai.balances.interestAccruedBy(address),
    rari.pools.ethereum.balances.interestAccruedBy(address),
    rari.getEthUsdPriceBN(),
  ]);

  const ethInterest = ethInterestInETH.mul(
    ethPriceBigNumber.div(constants.WeiPerEther)
  );

  return {
    totalFormattedEarnings: stringUsdFormatter(
        (stableInterest.add(yieldInterest).add(ethInterest).add(daiInterest)).div(constants.WeiPerEther).toString()
    ),
    totalEarnings: stableInterest
      .add(yieldInterest)
      .add(ethInterest)
      .add(daiInterest),
    yieldPoolInterestEarned: yieldInterest,
    stablePoolInterestEarned: stableInterest,
    daiPoolInterestEarned: daiInterest,
    ethPoolInterestEarned: ethInterest,
    ethPoolInterestEarnedInETH: ethInterestInETH,
  };
};

export type PoolInterestEarned = {
  totalFormattedEarnings: string;
  totalEarnings: BigNumber;
  daiPoolInterestEarned: BigNumber;
  yieldPoolInterestEarned: BigNumber;
  stablePoolInterestEarned: BigNumber;
  ethPoolInterestEarned: BigNumber;
  ethPoolInterestEarnedInETH: BigNumber;
};
