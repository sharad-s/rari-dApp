import { useQuery } from "react-query";
import { Fuse } from '../esm'
import { useRari } from "../context/RariContext";
import ERC20ABI from "../rari-sdk/abi/ERC20.json";
import { ETH_TOKEN_DATA } from "./useTokenData";

import { Contract } from "@ethersproject/contracts";


export const fetchTokenBalance = async (
  tokenAddress: string,
  fuse: Fuse,
  address: string
) => {
  let BalanceBN;

  if (
    tokenAddress === ETH_TOKEN_DATA.address ||
    tokenAddress === "NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS"
  ) {
    BalanceBN = await fuse.provider.getBalance(address);
  } else {
    const contract = new Contract(tokenAddress, ERC20ABI, fuse.provider);

    BalanceBN = await contract.balanceOf(address); // Will return a BN
  }

  return BalanceBN;
};

export function useTokenBalance(tokenAddress: string) {
  const { fuse, address } = useRari();

  return useQuery(tokenAddress + " balanceOf " + address, () =>
    fetchTokenBalance(tokenAddress, fuse, address)
  );
}
