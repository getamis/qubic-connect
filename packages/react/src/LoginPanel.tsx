import { LoginPanelProps as PreactLoginPanelProps } from '@qubic-creator/core';

import React, { useEffect, useRef } from 'react';
import { useQubicCreator } from './QubicCreatorContext';

export type LoginPanelProps = Omit<PreactLoginPanelProps, 'children'>;

const LoginPanel = React.memo<LoginPanelProps>(props => {
  const { methods, onLogin, ...restProps } = props;

  const { qubicCreatorSdkRef } = useQubicCreator();
  const buttonRef = useRef(null);

  useEffect(() => {
    qubicCreatorSdkRef.current.createLoginPanel(buttonRef.current, {
      methods,
      onLogin,
    });
  }, [methods, onLogin, qubicCreatorSdkRef]);

  return <div ref={buttonRef} {...restProps} />;
});

export default LoginPanel;
