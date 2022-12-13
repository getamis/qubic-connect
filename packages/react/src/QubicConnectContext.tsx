/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useRef } from 'react';
import { QubicConnectConfig, QubicConnect } from '@qubic-connect/core';

interface QubicConnectContextValue {
  qubicConnectRef: React.MutableRefObject<QubicConnect>;
}

const QubicConnectContext = React.createContext<QubicConnectContextValue>({} as any);

interface Props {
  children: React.ReactNode;
  config: QubicConnectConfig;
}

const QubicConnectContextProvider = React.memo<Props>(props => {
  const { config, children } = props;
  const qubicConnectRef = useRef(new QubicConnect(config));

  return <QubicConnectContext.Provider value={{ qubicConnectRef }}>{children}</QubicConnectContext.Provider>;
});

const useQubicConnect = (): QubicConnectContextValue => {
  return useContext(QubicConnectContext);
};

export { QubicConnectContextProvider, useQubicConnect };
