import { LoginModalProps as PreactLoginModalProps } from '@qubic-creator/core/dist/components/LoginModal';

import React, { useEffect, useRef } from 'react';
import { useQubicCreator } from './QubicCreatorContext';

export type LoginModalProps = Omit<PreactLoginModalProps, 'children'>;

const LoginModal = React.memo<LoginModalProps>(props => {
  const { qubicCreatorSdkRef } = useQubicCreator();
  const buttonRef = useRef(null);

  useEffect(() => {
    qubicCreatorSdkRef.current.createLoginModal(buttonRef.current, props);
  }, [props, qubicCreatorSdkRef]);

  return <div ref={buttonRef} />;
});

export default LoginModal;
