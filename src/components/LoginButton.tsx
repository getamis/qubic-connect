import { useCallback } from 'preact/hooks';
import { CSSProperties, FunctionComponent, memo } from 'preact/compat';
import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import jss from 'jss';
import clsx from 'clsx';
import QubicLogo from '../assets/qubic-logo.svg';
import MetamaskFox from '../assets/metamask-fox.svg';
import WalletConnectCircle from '../assets/walletconnect-circle-blue.svg';
import { SdkConfig, SdkOnLogin, SdkOnLogout } from '../types/QubicCreator';

import { ExtendedExternalProvider, ExtendedExternalProviderType } from '../types/ExtendedExternalProvider';
import { createSingMessageAndLogin } from './utils/singMessageAndLogin';
import { isWalletconnectProvider } from '../utils/isWalletconnectProvider';
import '../utils/fixWalletConnect';
import { commonClasses } from './styles';

export interface LoginButtonProps {
  method: ExtendedExternalProviderType;
  onLogin?: SdkOnLogin;
  onLogout?: SdkOnLogout;
  itemStyle?: CSSProperties;
}

const { classes } = jss
  .createStyleSheet({
    icon: {
      width: '24px',
      height: '24px',
      marginRight: '8px',
    },
  })
  .attach();

export function createLoginButtonElement(sdkConfig: SdkConfig): FunctionComponent<LoginButtonProps> {
  const {
    name: authAppName,
    service: authServiceName,
    domain: authAppUrl,
    key,
    secret,
    qubicWalletKey,
    qubicWalletSecret,
    infuraId,
    chainId,
  } = sdkConfig;

  const externalProviderMap: Record<
    ExtendedExternalProviderType,
    {
      buttonText: string;
      buttonIcon: string;
      provider: ExtendedExternalProvider;
    }
  > = {
    qubic: {
      buttonText: 'Qubic Wallet',
      buttonIcon: QubicLogo,
      provider: new QubicProvider({
        apiKey: qubicWalletKey,
        apiSecret: qubicWalletSecret,
        chainId: chainId || 1,
        infuraProjectId: infuraId,
        enableIframe: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    },
    metamask: {
      buttonText: 'MetaMask',
      buttonIcon: MetamaskFox,
      provider: window.ethereum,
    },
    walletconnect: {
      buttonText: 'WalletConnect',
      buttonIcon: WalletConnectCircle,
      provider: new WalletConnectProvider({
        chainId,
        infuraId,
      }),
    },
  };

  const LoginButton = memo<LoginButtonProps>(props => {
    const { method, onLogin, itemStyle } = props;

    const singMessageAndLogin = createSingMessageAndLogin({
      authAppName,
      authAppUrl,
      authServiceName,
      apiKey: key,
      apiSecret: secret,
    });
    const { buttonIcon, buttonText, provider } = externalProviderMap[method];

    const handleWalletLogin = useCallback(
      async (event: MouseEvent) => {
        try {
          event.preventDefault();
          event.stopPropagation();
          if (isWalletconnectProvider(method, provider)) {
            // https://github.com/WalletConnect/walletconnect-monorepo/issues/747
            await provider.enable();
          }
          const result = await singMessageAndLogin(method, provider);
          onLogin?.(null, {
            type: method,
            accessToken: result.accessToken,
            address: result.address,
            provider,
          });
        } catch (error) {
          if (error instanceof Error) {
            onLogin?.(error.message);
          }
        }
      },
      [method, onLogin, provider, singMessageAndLogin],
    );

    return (
      <button
        type="button"
        style={itemStyle}
        className={clsx(commonClasses.button, commonClasses.buttonWhite)}
        onClick={handleWalletLogin}
      >
        <img className={classes.icon} src={buttonIcon} alt="method-icon" />
        <span className={clsx(commonClasses.text)}>{buttonText}</span>
      </button>
    );
  });

  return LoginButton;
}
