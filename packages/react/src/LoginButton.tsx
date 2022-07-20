import { LoginButtonProps as PreactLoginButtonProps } from '@qubic-creator/core/dist/components/LoginButton';
import React, { useEffect, useRef } from 'react';
import { useQubicCreator } from './QubicCreatorContext';

export type LoginButtonProps = Omit<PreactLoginButtonProps, 'children'>;

const LoginButton = React.memo<LoginButtonProps>(props => {
  const { method, onLogin, style, onLogout } = props;

  const { qubicCreatorSdkRef } = useQubicCreator();
  const buttonRef = useRef(null);

  useEffect(() => {
    qubicCreatorSdkRef.current.createLoginButton(buttonRef.current, {
      method,
      onLogin,
      style,
      onLogout,
    });
  }, [method, onLogin, onLogout, qubicCreatorSdkRef, style]);

  return <div ref={buttonRef} />;
});

export default LoginButton;
