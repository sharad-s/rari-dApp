import { createContext, memo, useContext, useState, useEffect } from "react";
import { useRari } from "../../../context/RariContext";
import SaffronPoolABI from "./SaffronPoolABI.json";
import SaffronStrategyABI from "./SaffronStrategyABI.json";
import { SaffronStrategyAddress, SaffronPoolAddress } from "constants/saffron";
import { Contract } from 'ethers'

interface SaffronContextType {
  saffronStrategy: Contract;
  saffronPool: Contract;
}

export const SaffronContext =
  createContext<SaffronContextType | undefined>(undefined);

export const SaffronProvider = memo(({ children }) => {
  const { rari } = useRari();

  const [saffronStrategy, setSaffronStrategy] = useState(() => {
    return new Contract(
      SaffronStrategyABI as any,
      SaffronStrategyAddress
    );
  });

  const [saffronPool, setSaffronPool] = useState(() => {
    return new Contract(
      SaffronPoolABI as any,
      SaffronPoolAddress
    );
  });

  useEffect(() => {
    setSaffronStrategy(
      new Contract(
        SaffronStrategyABI as any,
        SaffronStrategyAddress
      )
    );

    setSaffronPool(
      new Contract(SaffronPoolABI as any, SaffronPoolAddress)
    );
  }, [rari]);

  return (
    <SaffronContext.Provider value={{ saffronStrategy, saffronPool }}>
      {children}
    </SaffronContext.Provider>
  );
});

export const useSaffronContracts = () => {
  const context = useContext(SaffronContext);

  if (context === undefined) {
    throw new Error(
      `useSaffronContracts must be used within a SaffronProvider`
    );
  }

  return context;
};
