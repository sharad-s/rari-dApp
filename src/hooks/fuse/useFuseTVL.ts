import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import {Vaults, Fuse} from "../../esm";
import { fetchFuseTVL } from "utils/fetchTVL";

import { constants } from 'ethers';

export const fetchFuseNumberTVL = async (rari: Vaults, fuse: Fuse) => {
  const tvlETH = await fetchFuseTVL(fuse);

  const ethPrice: number =   parseInt((await rari.getEthUsdPriceBN()).div(constants.WeiPerEther).toString());

  return (parseInt(tvlETH.toString()) / 1e18) * ethPrice;
};

export const useFuseTVL = () => {
  const { rari, fuse } = useRari();

  return useQuery("fuseTVL", async () => {
    return fetchFuseNumberTVL(rari, fuse);
  });
};
