import { useMemo } from "react";
import { useQuery, useQueries } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import { Vaults }from "../esm";
import { getSDKPool } from "../utils/poolUtils";
import { PoolInterface } from "constants/pools";
import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";
import { constants } from 'ethers';

interface UseQueryResponse {
  data: any;
  isLoading: boolean;
  error: any;
}

export const fetchPoolBalance = async ({
  pool,
  rari,
  address,
}: {
  pool: Pool;
  rari: Vaults;
  address: string;
}): Promise<BigNumber> => {
  const balance = await getSDKPool({ rari, pool }).balances.balanceOf(address);
  return balance;
};

export const usePoolBalance = (pool: Pool): UseQueryResponse => {
  const { address, rari } = useRari();

  const { data, isLoading, error } = useQuery(
    address + " " + pool + " balance",
    async () => {
      return fetchPoolBalance({ pool, rari, address });
    }
  );

  return { data, isLoading, error };
};

export const usePoolBalances = (pools: PoolInterface[]): UseQueryResponse[] => {
  const { rari, address } = useRari();

  // Fetch APYs for all pools
  const poolBalances = useQueries(
    pools.map(({ type: pool }) => {
      return {
        queryKey: address + " " + pool + " balance",
        queryFn: () => fetchPoolBalance({ pool, rari, address }),
      };
    })
  );

  return useMemo(
    () =>
      !poolBalances.length
        ? []
        : poolBalances.map(({ isLoading, error, data }) => ({
            isLoading,
            error,
            data,
          })),
    [poolBalances]
  );
};

export const useTotalPoolsBalance = (): UseQueryResponse => {
  const { rari, address } = useRari();

  const { isLoading, data, error } = useQuery(
    address + " allPoolBalance",
    async () => {
      const [stableBal, yieldBal, ethBalInETH, daiBal, ethPriceBN] =
        await Promise.all([
          rari.pools.stable.balances.balanceOf(address),
          rari.pools.yield.balances.balanceOf(address),
          rari.pools.ethereum.balances.balanceOf(address),
          rari.pools.dai.balances.balanceOf(address),
          rari.getEthUsdPriceBN(),
        ]);

      const ethBal = ethBalInETH.mul(
        ethPriceBN.div(constants.WeiPerEther)
      );

      return parseFloat(
        (stableBal.add(yieldBal).add(daiBal).add(ethBal)).div(constants.WeiPerEther).toString()
      );
    }
  );

  return { isLoading, data, error };
};
