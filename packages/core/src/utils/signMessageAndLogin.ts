import { ExtendedExternalProviderMethod, ExtendedExternalProvider } from '../types/ExtendedExternalProvider';
import { isWalletconnectProvider } from './isWalletconnectProvider';
import convertStringToHex from './convertStringToHex';
import { login } from '../api/auth';

export const createSignMessageAndLogin =
  (options: {
    creatorUrl: string;
    authAppName: string;
    authAppUrl: string;
    authServiceName: string;
    apiKey: string;
    apiSecret: string;
  }) =>
  async (
    providerType: ExtendedExternalProviderMethod,
    provider: ExtendedExternalProvider,
  ): Promise<{
    accessToken: string;
    address: string;
  }> => {
    const { creatorUrl, authAppName, authAppUrl, authServiceName, apiKey, apiSecret } = options;
    if (!provider?.request) {
      throw Error('provider.request not found');
    }

    const [accountAddress] = isWalletconnectProvider(providerType, provider)
      ? provider.accounts
      : await provider.request({ method: 'eth_requestAccounts' });

    if (provider.isQubic) {
      const signatureResult = await provider.request({
        method: 'qubic_issueIdentityTicket',
        params: [],
      });
      const signature = signatureResult[0];
      const resultData = await login({
        accountAddress,
        signature,
        dataString: '',
        isQubicUser: true,
        creatorUrl,
        apiKey,
        apiSecret,
      });
      return {
        accessToken: resultData.accessToken,
        address: accountAddress,
      };
    }
    const dataString = JSON.stringify({
      name: authAppName,
      url: authAppUrl,
      service: authServiceName,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });
    const signatureResult = await provider.request({
      method: 'personal_sign',
      params: [convertStringToHex(dataString), accountAddress],
    });
    const signature = signatureResult;
    const resultData = await login({
      accountAddress,
      signature,
      dataString,
      isQubicUser: false,
      creatorUrl,
      apiKey,
      apiSecret,
    });
    return {
      accessToken: resultData.accessToken,
      address: accountAddress,
    };
  };
