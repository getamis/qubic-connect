import { ComponentChildren, createContext } from 'preact';
import { memo, useCallback, useContext, useMemo, useState } from 'preact/compat';
import { isWalletconnectProvider } from '../utils/isWalletconnectProvider';
import {
  ExtendedExternalProvider,
  ExtendedExternalProviderMethod,
  WalletUser,
  OnLogin,
  OnLogout,
  QubicCreatorConfig,
} from '../types';
import { createSignMessageAndLogin } from '../utils/signMessageAndLogin';
import { BatchBuyAssetInput, BatchBuyAssetResult, createFetchBatchBuyAssetResult } from '../api/purchase';
import { ProviderOptions } from '../types/ExtendedExternalProvider';
import { logout as apiLogout } from '../api/auth';
import { SdkFetch } from '../utils/sdkFetch';
import { SdkRequestGraphql } from '../utils/graphql';

interface ApiContextValue {
  login: (method: ExtendedExternalProviderMethod) => Promise<WalletUser>;
  logout: () => Promise<void>;
  provider: ExtendedExternalProvider | null;
  accessToken: string | null;
  address: string | null;
  fetchBatchBuyAssetResult: (input: BatchBuyAssetInput) => Promise<BatchBuyAssetResult>;
  sdkFetch: SdkFetch;
  sdkRequestGraphql: SdkRequestGraphql;
  providerOptions?: ProviderOptions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApiContext = createContext<ApiContextValue>({} as any);

interface ApiContextProviderProps {
  children: ComponentChildren;
  config: QubicCreatorConfig;
  onLogin: OnLogin;
  onLogout: OnLogout;
  sdkFetch: SdkFetch;
  sdkRequestGraphql: SdkRequestGraphql;
}

const APP_AUTH_URL = window.location.origin;

export const ApiContextProvider = memo<ApiContextProviderProps>(props => {
  const { config, onLogin, onLogout, sdkFetch, sdkRequestGraphql } = props;
  const { name: authAppName, service: authServiceName, providerOptions } = config;

  // TODO: these three state should be set by CreatorSdk
  const [address, setAddress] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [provider, setProvider] = useState<ExtendedExternalProvider | null>(null);

  // TODO: login function should defined in CreatorSdk and pass from CreatorSdk
  const login = useCallback(
    async (method: ExtendedExternalProviderMethod) => {
      const option = providerOptions?.[method];
      if (!option) {
        throw Error(`providerOption.${method} not found`);
      }

      const { provider: optionProvider } = option;
      if (!optionProvider) {
        throw Error(`optionProvider not found`);
      }
      const signMessageAndLogin = createSignMessageAndLogin(sdkFetch, {
        authAppName,
        authAppUrl: APP_AUTH_URL,
        authServiceName,
      });
      try {
        if (isWalletconnectProvider(method, optionProvider)) {
          // https://github.com/WalletConnect/walletconnect-monorepo/issues/747
          await optionProvider.enable();
        }
        const { accessToken, expiredAt, address } = await signMessageAndLogin(method, optionProvider);
        const result: WalletUser = {
          method,
          accessToken,
          expiredAt,
          address,
          provider: optionProvider,
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
    [authAppName, authServiceName, onLogin, provider, providerOptions, sdkFetch],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout(sdkFetch);
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
  }, [onLogout, sdkFetch]);

  const fetchBatchBuyAssetResult = useMemo(() => {
    return createFetchBatchBuyAssetResult(sdkRequestGraphql);
  }, [sdkRequestGraphql]);

  return (
    <ApiContext.Provider
      value={{
        address,
        accessToken,
        provider,
        sdkFetch,
        sdkRequestGraphql,
        login,
        logout,
        fetchBatchBuyAssetResult,
        providerOptions,
      }}
    >
      {props.children}
    </ApiContext.Provider>
  );
});

export const useApi = (): ApiContextValue => {
  return useContext(ApiContext);
};
