import { useQuery } from "react-query";
import { useRari } from "context/RariContext";

import { constants } from 'ethers'

export const usePool2TotalStaked = () => {
  const { rari } = useRari();

  const { data: totalStaked } = useQuery("pool2TotalStaked", async () => {
    return parseFloat(
      ((
        await rari.governance.rgt.sushiSwapDistributions.totalStakedUsd()
      ).div(constants.WeiPerEther)).toString()
    );
  });

  return totalStaked;
};
