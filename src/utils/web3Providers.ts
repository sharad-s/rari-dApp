import { Fuse } from "../esm";
import { JsonRpcProvider, Web3Provider} from "@ethersproject/providers";
export const turboGethURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;

export function chooseBestWeb3Provider() {
  if (typeof window === "undefined") {
    return new JsonRpcProvider(turboGethURL);
  }

  if (window.ethereum) {
    return new Web3Provider(window.ethereum);
  } else if (window.web3) {
    return new Web3Provider(window.web3.currentProvider);
  } else {
    return new JsonRpcProvider(turboGethURL);
  }
}

export const initFuseWithProviders = (provider = chooseBestWeb3Provider()) => {
  const fuse = new Fuse(provider);

  // @ts-ignore We have to do this to avoid Infura ratelimits on our large calls.
  const turboProvider = new JsonRpcProvider(turboGethURL);
  fuse.contracts.FusePoolLens = fuse.contracts.FusePoolLens.connect(turboProvider);

  return fuse;
};
