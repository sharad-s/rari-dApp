import { Fuse } from "../esm";
import { Contract } from "@ethersproject/contracts";

export const createComptroller = (comptrollerAddress: string, fuse: Fuse) => {
  const comptroller = new Contract(
    comptrollerAddress,
    JSON.parse(
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
    ),
    fuse.provider
  );

  return comptroller;
};
