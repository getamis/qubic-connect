import { LoginModalProps as PreactLoginModalProps } from '@qubic-connect/core/dist/components/LoginModal';

import React, { useEffect, useRef } from 'react';
import { useQubicConnect } from './QubicConnectContext';

export type LoginModalProps = Omit<PreactLoginModalProps, 'children'>;

const LoginModal = React.memo<LoginModalProps>(props => {
  const { qubicConnectRef } = useQubicConnect();
  const buttonRef = useRef(null);

  useEffect(() => {
    qubicConnectRef.current.createLoginModal(buttonRef.current, props);
  }, [props, qubicConnectRef]);

  return <div ref={buttonRef} />;
});

export default LoginModal;
