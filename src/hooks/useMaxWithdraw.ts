import { useQuery } from "react-query";
import { usePoolType } from "../context/PoolContext";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import { getSDKPool } from "../utils/poolUtils";
import { fetchPoolBalance } from "./usePoolBalance";
import { Vaults } from "esm";
import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";

export const fetchMaxWithdraw = async ({
  rari,
  address,
  poolType,
  symbol,
}: {
  rari: Vaults;
  address: string;
  symbol: string;
  poolType: Pool;
}) => {
  const bigBalance = await fetchPoolBalance({
    pool: poolType,
    rari,
    address,
  });

  const [amount] = await getSDKPool({
    rari,
    pool: poolType,
  }).withdrawals.getMaxWithdrawalAmount(symbol, bigBalance);

  return amount as BigNumber;
};

export const useMaxWithdraw = (symbol: string) => {
  const { rari, address } = useRari();

  const poolType = usePoolType();

  const { data: max, isLoading: isMaxLoading } = useQuery(
    address + " max " + symbol,
    async () => {
      return fetchMaxWithdraw({ rari, address, symbol, poolType });
    }
  );

  return { max, isMaxLoading };
};
