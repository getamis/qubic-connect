import { LoginButtonProps as PreactLoginButtonProps } from '@qubic-creator/core/dist/components/LoginButton';
import React, { useEffect, useRef } from 'react';
import { useQubicCreator } from './QubicCreatorContext';

export type LoginButtonProps = Omit<PreactLoginButtonProps, 'children'>;

const LoginButton = React.memo<LoginButtonProps>(props => {
  const { qubicCreatorSdkRef } = useQubicCreator();
  const buttonRef = useRef(null);

  useEffect(() => {
    qubicCreatorSdkRef.current.createLoginButton(buttonRef.current, props);
  }, [props, qubicCreatorSdkRef]);

  return <div ref={buttonRef} />;
});

export default LoginButton;
