import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import {Vaults} from 'esm'

import { constants } from 'ethers'

export const fetchPool2UnclaimedRGT = async ({
  rari,
  address,
}: {
  rari: Vaults;
  address: string;
}) => {
  return parseFloat(
    ((
      await rari.governance.rgt.sushiSwapDistributions.getUnclaimed(address)
    ).div(constants.WeiPerEther)).toString()
  );
};

export const usePool2UnclaimedRGT = () => {
  const { rari, address } = useRari();

  const { data: earned } = useQuery(
    address + " pool2Unclaimed RGT",
    async () => await fetchPool2UnclaimedRGT({ rari, address })
  );

  return earned;
};
