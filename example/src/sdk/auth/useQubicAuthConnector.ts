import { useCallback, useEffect, useState } from 'react';
import { QubicConnector } from '@qubic-js/react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useQuery } from 'graphql-hooks';

import { QUBIC_API_KEY, QUBIC_API_SECRET, QUBIC_CHAIN_ID, QUBIC_INFURA_PROJECT_ID } from '../constants/environment';

interface BaseUserData {
  accessToken?: string | undefined;
  expiredAt?: number | undefined;
}

interface UserData extends BaseUserData {
  address?: string;
  email?: string;
  phone?: string;
  name?: string;
  isQubicUser?: boolean;
}

export interface QubicAuthConnector {
  qubicConnector: any | null;
  user: UserData | undefined | null;
  timeDiff: number;
  setUser: (user: UserData | null) => void;
  updateUser: (update: { address?: string; email?: string }) => void;
}

interface QubicAuthConnectorProps {
  clientName?: string;
}

type NowGqlResult = {
  now: number;
};

let qubicConnector: QubicConnector;
let timeSample: number = 0;
const TIME_DIFF_LIMIT_MSEC = 1000;

const GQL_NOW = `query NOW_PUBLIC {
  now
}`;

export const useQubicAuthConnector = ({ clientName }: QubicAuthConnectorProps) => {
  const context = useWeb3React<Web3Provider>();
  const { deactivate } = context;
  const [user, setUser] = useState<UserData | undefined | null>(undefined);
  const [timeDiff, setTimeDiff] = useState<number>(0);

  const { data, loading } = useQuery<NowGqlResult>(GQL_NOW, {
    // operationName: `NOW_PUBLIC`,
    // context: { clientType: 'public', clientName },
    // notifyOnNetworkStatusChange: true,
    // fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (loading) {
      // Expect first time render loading is true
      timeSample = Date.now();
    } else if (timeSample > 0) {
      // Prevent first time loading is false situation.
      timeSample += Date.now();
      if (data?.now) {
        const diff = data.now * 1000 - Math.floor(0.5 * timeSample);
        if (Math.abs(diff) > TIME_DIFF_LIMIT_MSEC) {
          console.warn('Device local time not align with server time.');
          setTimeDiff(diff);
        }
      }
    }
  }, [loading, data]);

  const updateUser = useCallback(
    ({ address, email }: UserData) => {
      setUser({
        ...user,
        address,
        email,
      });
    },
    [user],
  );

  useEffect(() => {
    try {
      qubicConnector = new QubicConnector({
        apiKey: QUBIC_API_KEY,
        apiSecret: QUBIC_API_SECRET,
        chainId: Number(QUBIC_CHAIN_ID),
        infuraProjectId: QUBIC_INFURA_PROJECT_ID,
        autoHideWelcome: true,
        enableIframe: true,
      });
    } catch (err) {
      // do nothing
    }
  }, []);

  useEffect(() => {
    try {
      const authLocal = localStorage.getItem('creator-auth');
      const authRecover = JSON.parse(authLocal || '{}');
      const { expiredAt } = authRecover || {};

      if (expiredAt) {
        if (expiredAt * 1000 < Date.now()) {
          setUser(null);
          deactivate();
          localStorage.removeItem('creator-auth');
          return;
        }
      }

      setUser(authRecover || null);
    } catch (err) {
      // do nothing
      setUser(undefined);
    }
  }, [deactivate]);

  return { qubicConnector, user, timeDiff, setUser, updateUser };
};
