import { useCallback, useMemo, useState } from 'preact/hooks';
import { CSSProperties, memo } from 'preact/compat';
import jss from 'jss';
import clsx from 'clsx';
import { commonClasses } from './styles';
import { OnLogin, OnLogout } from '../types/QubicCreator';
import { ExtendedExternalProviderMethod } from '../types/ExtendedExternalProvider';
import '../utils/fixWalletConnect';
import { useApi } from './ApiProvider';
import { EXTERNAL_PROVIDER_MAP } from '../constants/externalProvider';

export interface LoginButtonProps {
  method: ExtendedExternalProviderMethod;
  onLogin?: OnLogin;
  onLogout?: OnLogout;
  style?: CSSProperties;
}

const { classes } = jss
  .createStyleSheet({
    icon: {
      marginRight: 8,
      width: 24,
      height: 24,
    },
  })
  .attach();

export const LoginButton = memo<LoginButtonProps>(props => {
  const { method, onLogin, onLogout, style } = props;
  const { IconComponent, displayName } = EXTERNAL_PROVIDER_MAP[method];

  const { login, logout, providerOptions } = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const DisplayIcon = useMemo(() => {
    const display = providerOptions[method]?.display;
    if (display?.logo) {
      return <img src={display.logo} className={classes.icon} alt="logo" />;
    }
    return IconComponent && <IconComponent className={classes.icon} />;
  }, [IconComponent, method, providerOptions]);

  const DisplayName = useMemo(() => {
    const display = providerOptions[method]?.display;
    if (display?.name) {
      return <span className={clsx(commonClasses.text)}>{display.name}</span>;
    }
    return <span className={clsx(commonClasses.text)}>{displayName}</span>;
  }, [displayName, method, providerOptions]);

  if (!providerOptions[method]) {
    console.error(`providerOptions[method] ${method} not found`);
    return null;
  }
  if (method === 'metamask' && providerOptions.metamask && !providerOptions.metamask.provider) {
    console.warn(`no metamask plugin detected, skip`);
    return null;
  }

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
      {DisplayIcon}
      {DisplayName}
    </button>
  );
});

export default LoginButton;
