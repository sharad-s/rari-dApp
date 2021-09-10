import { stringUsdFormatter } from "./bigUtils";
import { constants } from 'ethers'

// Formats a BN balance USD or ETH denominated string
export const formatBalanceBN = (
  balanceData: any, // TODO: BigNumber type from ethers
  shouldFormatETH: boolean = false
): string | null => {
  if (!balanceData) return null;

  let formattedBalance = stringUsdFormatter(
    balanceData.div(constants.WeiPerEther).toString()
  );

  if (shouldFormatETH)
    formattedBalance = formattedBalance.replace("$", "") + " ETH";

  return formattedBalance;
};
