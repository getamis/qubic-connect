import { CSSProperties, memo, useCallback, useState } from 'preact/compat';
import clsx from 'clsx';

import { commonClasses } from '../styles';
import { ExtendedExternalProviderMethod, OnLogin, OnLogout } from '../../types';
import LoginButton, { LoginButtonProps } from '../LoginButton';
import { LoginModalContainer, LoginModalContainerProps } from './LoginModalContainer';
import { useApi } from '../ApiProvider';

const ALLOWED_METHODS: ExtendedExternalProviderMethod[] = ['qubic', 'metamask', 'walletconnect'];

export interface LoginModalProps
  extends Omit<LoginButtonProps, 'method' | 'style'>,
    Omit<LoginModalContainerProps, 'children'> {
  methods?: ExtendedExternalProviderMethod[];
  itemStyle?: CSSProperties;
}

const LoginModal = memo<LoginModalProps>(props => {
  const { methods, onLogin, onLogout, itemStyle, ...restProps } = props;
  const { logout } = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogin: OnLogin = useCallback(
    (error, result) => {
      setIsLoggedIn(true);
      onLogin?.(error, result);
    },
    [onLogin],
  );

  const handleLogout: OnLogout = useCallback(
    error => {
      setIsLoggedIn(false);
      onLogout?.(error);
    },
    [onLogout],
  );

  const handleLogoutButtonClick = useCallback(async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      onLogout?.(null);
    } catch (error) {
      if (error instanceof Error) {
        onLogout?.(error);
      }
    }
  }, [logout, onLogout]);

  return (
    <LoginModalContainer {...restProps}>
      {isLoggedIn ? (
        <button
          type="button"
          style={itemStyle}
          className={clsx(commonClasses.button, commonClasses.buttonWhite)}
          onClick={handleLogoutButtonClick}
        >
          <span className={clsx(commonClasses.text)}>Logout</span>
        </button>
      ) : (
        methods?.map(method => {
          if (!ALLOWED_METHODS.includes(method)) return null;
          return (
            <LoginButton key={method} method={method} onLogin={handleLogin} onLogout={handleLogout} style={itemStyle} />
          );
        })
      )}
    </LoginModalContainer>
  );
});
export default LoginModal;
