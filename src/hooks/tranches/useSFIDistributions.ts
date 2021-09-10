import { useQuery } from "react-query";
import { useSaffronData } from "./useSaffronData";

import { tranchePoolIndex, TranchePool } from "./useSaffronData";

import { constants } from 'ethers'

export const useSFIDistributions = () => {
  const { saffronStrategy } = useSaffronData();

  const { data: sfiDistributions } = useQuery("sfiDistributions", async () => {
    const DAI =((
      await saffronStrategy.pool_SFI_rewards(tranchePoolIndex(TranchePool.DAI))
    ).div(constants.WeiPerEther)).toString();
    const USDC = ((
      await saffronStrategy.callStatic.pool_SFI_rewards(tranchePoolIndex(TranchePool.USDC))
    ).div(constants.WeiPerEther)).toString();
    return { DAI, USDC };
  });

  return sfiDistributions;
};
