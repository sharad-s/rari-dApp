import { constants } from "ethers";
import { useCallback } from "react";
import { useRari } from "../context/RariContext";
import { fetchTVL } from "../utils/fetchTVL";

export const useTVLFetchers = () => {
  const { rari, fuse } = useRari();

  const getTVL = useCallback(() => fetchTVL(rari, fuse), [rari, fuse]);


  const getNumberTVL = useCallback(async () => {
    return parseFloat(((await getTVL()).div(constants.WeiPerEther)).toString());
  }, [getTVL]);

  return { getNumberTVL, getTVL };
};
