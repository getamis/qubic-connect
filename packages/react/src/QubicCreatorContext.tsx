/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useRef } from 'react';
import QubicCreatorSdk, { QubicCreatorConfig } from '@qubic-creator/core';

interface QubicCreatorContextValue {
  qubicCreatorSdkRef: React.MutableRefObject<QubicCreatorSdk>;
}

const QubicCreatorContext = React.createContext<QubicCreatorContextValue>({} as any);

interface Props {
  children: React.ReactNode;
  config: QubicCreatorConfig;
}

const QubicCreatorContextProvider = React.memo<Props>(props => {
  const { config, children } = props;
  const qubicCreatorSdkRef = useRef(new QubicCreatorSdk(config));

  return <QubicCreatorContext.Provider value={{ qubicCreatorSdkRef }}>{children}</QubicCreatorContext.Provider>;
});

const useQubicCreator = (): QubicCreatorContextValue => {
  return useContext(QubicCreatorContext);
};

export { QubicCreatorContextProvider, useQubicCreator };
