import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { DASHBOARD_BOX_PROPS } from "../components/shared/DashboardBox";

import LogRocket from "logrocket";
import { useToast } from "@chakra-ui/react";
import { Fuse, Vaults }from "../esm";
import {
  chooseBestWeb3Provider,
  initFuseWithProviders,
  turboGethURL,
} from "../utils/web3Providers";
import { useLocation } from "react-router-dom";
import { Web3Provider } from "@ethersproject/providers";

async function launchModalLazy(
  t: (text: string, extra?: any) => string,
  cacheProvider: boolean = true
) {
  const [WalletConnectProvider, Web3Modal] = await Promise.all([
    import("@walletconnect/web3-provider"),
    import("web3modal"),
  ]);

  const providerOptions = {
    injected: {
      display: {
        description: t("Connect with a browser extension"),
      },
      package: null,
    },
    walletconnect: {
      package: WalletConnectProvider.default,
      options: {
        rpc: {
          1: turboGethURL,
        },
      },
      display: {
        description: t("Scan with a wallet to connect"),
      },
    },
  };

  if (!cacheProvider) {
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
  }

  const web3Modal = new Web3Modal.default({
    cacheProvider,
    providerOptions,
    theme: {
      background: DASHBOARD_BOX_PROPS.backgroundColor,
      main: "#FFFFFF",
      secondary: "#858585",
      border: DASHBOARD_BOX_PROPS.borderColor,
      hover: "#000000",
    },
  });

  return web3Modal.connect();
}

export interface RariContextData {
  rari: Vaults;
  fuse: Fuse;
  web3ModalProvider: any | null;
  isAuthed: boolean;
  login: (cacheProvider?: boolean) => Promise<any>;
  logout: () => any;
  address: string;
  isAttemptingLogin: boolean;
}

export const EmptyAddress = "0x0000000000000000000000000000000000000000";

export const RariContext = createContext<RariContextData | undefined>(
  undefined
);

export const RariProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();

  const location = useLocation();
  const [rari, setRari] = useState<Vaults>(
    () => new Vaults(chooseBestWeb3Provider())
  );
  const [fuse, setFuse] = useState<Fuse>(() => initFuseWithProviders());

  const [isAttemptingLogin, setIsAttemptingLogin] = useState<boolean>(false);

  const toast = useToast();

  // Check the user's network:
  useEffect(() => {
    //@ts-ignore
    Promise.all([rari.provider.send("net_version"), rari.provider.getNetwork()]).then(
      ([netId, chainId]) => {
        console.log("Network ID: " + netId, "Chain ID: " + chainId.chainId);

        // Don't show "wrong network" toasts if dev
        if (process.env.NODE_ENV === "development") {
          return;
        }

        if (netId !== 1 || chainId.chainId !== 1) {
          setTimeout(() => {
            toast({
              title: "Wrong network!",
              description:
                "You are on the wrong network! Switch to the mainnet and reload this page!",
              status: "warning",
              position: "top-right",
              duration: 300000,
              isClosable: true,
            });
          }, 1500);
        }
      }
    );
  }, [rari, toast]);

  const [address, setAddress] = useState<string>(EmptyAddress);

  const [web3ModalProvider, setWeb3ModalProvider] = useState<any | null>(null);

  const queryClient = useQueryClient();

  const setRariAndAddressFromModal = useCallback(
    (modalProvider) => {
      const provider = new Web3Provider(modalProvider)
      const rariInstance = new Vaults(provider);
      const fuseInstance = initFuseWithProviders(provider);

      setRari(rariInstance);
      setFuse(fuseInstance);

      rariInstance.provider.listAccounts().then((addresses: string[]) => {
        if (addresses.length === 0) {
          console.log("Address array was empty. Reloading!");
          window.location.reload();
        }

        const address = addresses[0];
        const requestedAddress = new URLSearchParams(location.search).get(
          "address"
        );

        console.log("Setting Logrocket user to new address: " + address);
        LogRocket.identify(address);

        console.log("Requested address: ", requestedAddress);
        setAddress(requestedAddress ?? address);
      });
    },
    [setRari, setAddress, location.search]
  );

  const login = useCallback(
    async (cacheProvider: boolean = true) => {
      try {
        setIsAttemptingLogin(true);
        const provider = await launchModalLazy(t, cacheProvider);
        setWeb3ModalProvider(provider);
        setRariAndAddressFromModal(provider);
        setIsAttemptingLogin(false);
      } catch (err) {
        setIsAttemptingLogin(false);
        return console.error(err);
      }
    },
    [setWeb3ModalProvider, setRariAndAddressFromModal, setIsAttemptingLogin, t]
  );

  const refetchAccountData = useCallback(() => {
    console.log("New account, clearing the queryClient!");

    setRariAndAddressFromModal(web3ModalProvider);

    queryClient.clear();
  }, [setRariAndAddressFromModal, web3ModalProvider, queryClient]);

  const logout = useCallback(() => {
    setWeb3ModalProvider((past: any) => {
      if (past?.off) {
        past.off("accountsChanged", refetchAccountData);
        past.off("chainChanged", refetchAccountData);
      }

      return null;
    });

    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");

    setAddress(EmptyAddress);
  }, [setWeb3ModalProvider, refetchAccountData]);

  useEffect(() => {
    if (web3ModalProvider !== null && web3ModalProvider.on) {
      web3ModalProvider.on("accountsChanged", refetchAccountData);
      web3ModalProvider.on("chainChanged", refetchAccountData);
    }

    return () => {
      if (web3ModalProvider?.off) {
        web3ModalProvider.off("accountsChanged", refetchAccountData);
        web3ModalProvider.off("chainChanged", refetchAccountData);
      }
    };
  }, [web3ModalProvider, refetchAccountData]);

  // Automatically open the web3modal if they have previously logged in on the site:
  useEffect(() => {
    if (localStorage.WEB3_CONNECT_CACHED_PROVIDER) {
      login();
    }
  }, [login]);

  const value = useMemo(
    () => ({
      web3ModalProvider,
      rari,
      fuse,
      isAuthed: address !== EmptyAddress,
      login,
      logout,
      address,
      isAttemptingLogin,
    }),
    [rari, web3ModalProvider, login, logout, address, fuse, isAttemptingLogin]
  );

  return <RariContext.Provider value={value}>{children}</RariContext.Provider>;
};

export function useRari() {
  const context = useContext(RariContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
}
