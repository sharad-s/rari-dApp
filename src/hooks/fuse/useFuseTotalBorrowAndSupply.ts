import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import {Vaults, Fuse} from 'esm';

export const fetchFuseTotalBorrowAndSupply = async ({
  rari,
  fuse,
  address,
}: {
  rari: Vaults;
  fuse: Fuse;
  address: string;
}) => {
  const [{ 0: supplyETH, 1: borrowETH }, ethPrice] = await Promise.all([
    fuse.contracts.FusePoolLens.callStatic.getUserSummary(address),

    (parseInt((await rari.getEthUsdPriceBN()).toString()) / 1e18)
  ]);

  return {
    totalSuppliedUSD: (supplyETH / 1e18) * ethPrice,
    totalBorrowedUSD: (borrowETH / 1e18) * ethPrice,
  };
};

export const useFuseTotalBorrowAndSupply = () => {
  const { rari, fuse, address } = useRari();

  const { data, isLoading, isError } = useQuery(
    address + " totalBorrowAndSupply",
    async () => fetchFuseTotalBorrowAndSupply({ rari, fuse, address })
  );

  return { data, isLoading, isError };
};
