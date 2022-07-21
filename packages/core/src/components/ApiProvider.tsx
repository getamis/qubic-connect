import { ComponentChildren, createContext } from 'preact';
import { memo, useCallback, useContext, useMemo, useState } from 'preact/compat';
import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { CREATOR_API_URL } from '../constants/backend';
import { isWalletconnectProvider } from '../utils/isWalletconnectProvider';
import {
  ExtendedExternalProvider,
  ExtendedExternalProviderMethod,
  LoginResult,
  OnLogin,
  OnLogout,
  QubicCreatorConfig,
} from '../types';
import { createSingMessageAndLogin } from './utils/singMessageAndLogin';
import { BatchBuyAssetInput, BatchBuyAssetResult, createFetchBatchBuyAssetResult } from '../api/purchase';
import { createLogout } from './utils/logout';

interface ApiContextValue {
  login: (method: ExtendedExternalProviderMethod) => Promise<LoginResult>;
  logout: () => Promise<void>;
  provider: ExtendedExternalProvider | null;
  accessToken: string | null;
  address: string | null;
  fetchBatchBuyAssetResult: (input: BatchBuyAssetInput) => Promise<BatchBuyAssetResult>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApiContext = createContext<ApiContextValue>({} as any);

interface ApiContextProviderProps {
  children: ComponentChildren;
  config: QubicCreatorConfig;
  onLogin: OnLogin;
  onLogout: OnLogout;
}

export const ApiContextProvider = memo<ApiContextProviderProps>(props => {
  const { config, onLogin, onLogout } = props;
  const {
    name: authAppName,
    service: authServiceName,
    domain: authAppUrl,
    key,
    secret,
    qubicWalletUrl,
    qubicWalletKey,
    qubicWalletSecret,
    infuraId,
    chainId,
    creatorUrl = CREATOR_API_URL,
  } = config;

  const [address, setAddress] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [provider, setProvider] = useState<ExtendedExternalProvider | null>(null);

  const externalProviderMap = useMemo<Record<ExtendedExternalProviderMethod, ExtendedExternalProvider>>(
    () => ({
      qubic: new QubicProvider({
        walletUrl: qubicWalletUrl,
        apiKey: qubicWalletKey,
        apiSecret: qubicWalletSecret,
        chainId: chainId || 1,
        infuraProjectId: infuraId,
        enableIframe: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
      metamask: window.ethereum,
      walletconnect: new WalletConnectProvider({
        chainId,
        infuraId,
      }),
    }),
    [chainId, infuraId, qubicWalletKey, qubicWalletSecret, qubicWalletUrl],
  );

  const login = useCallback(
    async (method: ExtendedExternalProviderMethod) => {
      const singMessageAndLogin = createSingMessageAndLogin({
        authAppName,
        authAppUrl,
        authServiceName,
        creatorUrl,
        apiKey: key,
        apiSecret: secret,
      });
      const provider = externalProviderMap[method];
      try {
        if (isWalletconnectProvider(method, provider)) {
          // https://github.com/WalletConnect/walletconnect-monorepo/issues/747
          await provider.enable();
        }
        const { accessToken, address } = await singMessageAndLogin(method, provider);
        const result = {
          method,
          accessToken,
          address,
          provider,
        };

        setAccessToken(accessToken);
        setAddress(address);
        setProvider(provider);
        onLogin(null, result);

        return result;
      } catch (error) {
        if (error instanceof Error) {
          onLogin(error);
        }
        throw error;
      }
    },
    [authAppName, authAppUrl, authServiceName, creatorUrl, externalProviderMap, key, onLogin, secret],
  );

  const logout = useCallback(async () => {
    const logout = createLogout({
      creatorUrl,
      apiKey: key,
      apiSecret: secret,
    });
    try {
      await logout();
      setAccessToken(null);
      setAddress(null);
      setProvider(null);
      onLogout(null);
    } catch (error) {
      if (error instanceof Error) {
        onLogout(error);
      }
      throw error;
    }
  }, [creatorUrl, key, onLogout, secret]);

  const fetchBatchBuyAssetResult = useMemo(() => {
    return createFetchBatchBuyAssetResult({
      apiKey: key,
      apiSecret: secret,
    });
  }, [key, secret]);

  return (
    <ApiContext.Provider
      value={{
        address,
        accessToken,
        provider,
        login,
        logout,
        fetchBatchBuyAssetResult,
      }}
    >
      {props.children}
    </ApiContext.Provider>
  );
});

export const useApi = (): ApiContextValue => {
  return useContext(ApiContext);
};
