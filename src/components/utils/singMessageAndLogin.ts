import { ExtendedExternalProviderType, ExtendedExternalProvider } from '../../types/ExtendedExternalProvider';
import { isWalletconnectProvider } from '../../utils/isWalletconnectProvider';
import convertStringToHex from '../../utils/convertStringToHex';
import { login } from '../../api/auth';

export const createSingMessageAndLogin =
  (options: { authAppName: string; authAppUrl: string; authServiceName: string; apiKey: string; apiSecret: string }) =>
  async (
    providerType: ExtendedExternalProviderType,
    provider: ExtendedExternalProvider,
  ): Promise<{
    accessToken: string;
    address: string;
  }> => {
    const { authAppName, authAppUrl, authServiceName, apiKey, apiSecret } = options;
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
      apiKey,
      apiSecret,
    });
    return {
      accessToken: resultData.accessToken,
      address: accountAddress,
    };
  };
