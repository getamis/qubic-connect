import { LoginButtonProps as PreactLoginButtonProps } from '@qubic-connect/core/dist/components/LoginButton';
import React, { useEffect, useRef } from 'react';
import { useQubicConnect } from './QubicConnectContext';

export type LoginButtonProps = Omit<PreactLoginButtonProps, 'children'>;

const LoginButton = React.memo<LoginButtonProps>(props => {
  const { qubicConnectRef } = useQubicConnect();
  const buttonRef = useRef(null);

  useEffect(() => {
    qubicConnectRef.current.createLoginButton(buttonRef.current, props);
  }, [props, qubicConnectRef]);

  return <div ref={buttonRef} />;
});

export default LoginButton;
