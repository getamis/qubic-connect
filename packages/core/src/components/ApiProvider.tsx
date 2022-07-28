import { ComponentChildren, createContext } from 'preact';
import { memo, useCallback, useContext, useMemo, useState } from 'preact/compat';
import { isWalletconnectProvider } from '../utils/isWalletconnectProvider';
import {
  ExtendedExternalProvider,
  ExtendedExternalProviderMethod,
  LoginResult,
  OnLogin,
  OnLogout,
  QubicCreatorConfig,
} from '../types';
import { createSingMessageAndLogin } from '../utils/singMessageAndLogin';
import { BatchBuyAssetInput, BatchBuyAssetResult, createFetchBatchBuyAssetResult } from '../api/purchase';
import { createLogout } from '../utils/logout';
import { ProviderOptions } from '../types/QubicCreator';
import { CREATOR_API_URL } from '../constants/backend';

interface ApiContextValue {
  login: (method: ExtendedExternalProviderMethod) => Promise<LoginResult>;
  logout: () => Promise<void>;
  provider: ExtendedExternalProvider | null;
  accessToken: string | null;
  address: string | null;
  fetchBatchBuyAssetResult: (input: BatchBuyAssetInput) => Promise<BatchBuyAssetResult>;

  providerOptions: ProviderOptions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApiContext = createContext<ApiContextValue>({} as any);

interface ApiContextProviderProps {
  children: ComponentChildren;
  config: QubicCreatorConfig;
  onLogin: OnLogin;
  onLogout: OnLogout;
}

const APP_AUTH_URL = window.location.origin;

export const ApiContextProvider = memo<ApiContextProviderProps>(props => {
  const { config, onLogin, onLogout } = props;
  const {
    name: authAppName,
    service: authServiceName,
    key,
    secret,
    creatorUrl = CREATOR_API_URL,
    providerOptions,
  } = config;

  const [address, setAddress] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [provider, setProvider] = useState<ExtendedExternalProvider | null>(null);

  const login = useCallback(
    async (method: ExtendedExternalProviderMethod) => {
      const option = providerOptions[method];
      if (!option) {
        throw Error(`providerOption.${method} not found`);
      }

      if (method === 'metamask' && !option.provider.isMetaMask) {
        throw Error('metamask only accept metamask provider');
      }

      if (method === 'qubic' && !option.provider.isQubic) {
        throw Error('Qubic only accept Qubic provider');
      }

      if (method === 'walletconnect' && !option.provider.isWalletConnect) {
        throw Error('walletconnect only accept WalletConnect provider');
      }

      const { provider: optionProvider } = option;
      const singMessageAndLogin = createSingMessageAndLogin({
        authAppName,
        authAppUrl: APP_AUTH_URL,
        authServiceName,
        creatorUrl,
        apiKey: key,
        apiSecret: secret,
      });
      try {
        if (isWalletconnectProvider(method, optionProvider)) {
          // https://github.com/WalletConnect/walletconnect-monorepo/issues/747
          await optionProvider.enable();
        }
        const { accessToken, address } = await singMessageAndLogin(method, optionProvider);
        const result = {
          method,
          accessToken,
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
    [authAppName, authServiceName, creatorUrl, key, onLogin, provider, providerOptions, secret],
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
