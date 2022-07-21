import { useCallback, useState } from 'preact/hooks';
import { CSSProperties, memo } from 'preact/compat';
import jss from 'jss';
import clsx from 'clsx';
import { ComponentChildren } from 'preact';
import { OnLogin, OnLogout } from '../types/QubicCreator';

import { ExtendedExternalProviderMethod } from '../types/ExtendedExternalProvider';
import '../utils/fixWalletConnect';
import { commonClasses } from './styles';
import SvgQubicLogo from './icons/QubicLogo';
import SvgMetamaskFox from './icons/MetamaskFox';
import SvgWalletconnectCircleBlue from './icons/WalletconnectCircleBlue';
import { useApi } from './ApiProvider';

export interface LoginButtonProps {
  method: ExtendedExternalProviderMethod;
  onLogin?: OnLogin;
  onLogout?: OnLogout;
  style?: CSSProperties;
}

const { classes } = jss
  .createStyleSheet({
    icon: {
      marginRight: '8px',
    },
  })
  .attach();

const EXTERNAL_PROVIDER_MAP: Record<
  ExtendedExternalProviderMethod,
  {
    buttonText: string;
    buttonIcon: ComponentChildren;
  }
> = {
  qubic: {
    buttonText: 'Qubic Wallet',
    buttonIcon: <SvgQubicLogo className={classes.icon} />,
  },
  metamask: {
    buttonText: 'MetaMask',
    buttonIcon: <SvgMetamaskFox className={classes.icon} />,
  },
  walletconnect: {
    buttonText: 'WalletConnect',
    buttonIcon: <SvgWalletconnectCircleBlue className={classes.icon} />,
  },
};

export const LoginButton = memo<LoginButtonProps>(props => {
  const { method, onLogin, onLogout, style } = props;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { buttonIcon, buttonText } = EXTERNAL_PROVIDER_MAP[method];
  const { login, logout } = useApi();

  const handleWalletLogin = useCallback(
    async (event: MouseEvent) => {
      try {
        event.preventDefault();
        event.stopPropagation();

        const result = await login(method);
        setIsLoggedIn(true);
        onLogin?.(null, result);
      } catch (error) {
        if (error instanceof Error) {
          onLogin?.(error);
        }
      }
    },
    [login, method, onLogin],
  );

  const handleLogout = useCallback(
    async (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await logout?.();
        onLogout?.(null);
      } catch (error) {
        if (error instanceof Error) {
          onLogout?.(error);
        }
      }
    },
    [logout, onLogout],
  );

  return isLoggedIn ? (
    <button
      type="button"
      style={style}
      className={clsx(commonClasses.button, commonClasses.buttonWhite)}
      onClick={handleLogout}
    >
      <span className={clsx(commonClasses.text)}>Logout</span>
    </button>
  ) : (
    <button
      type="button"
      style={style}
      className={clsx(commonClasses.button, commonClasses.buttonWhite)}
      onClick={handleWalletLogin}
    >
      {buttonIcon}
      <span className={clsx(commonClasses.text)}>{buttonText}</span>
    </button>
  );
});

export default LoginButton;
