import { useCallback, useEffect, useState } from 'react';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { IInternalEvent as WCInternalEvent } from '@walletconnect/types';

// import { WALLET_CONNECT_BRIDGE } from '@/constants/walletConnect';
// import { apiGetAccountAssets } from '@/utils/walletConnect';
// import { WCAssetData } from '@/types/walletConnect';

export interface WCAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress: string;
  balance?: string;
}

interface UseWalletConnectProps {
  onConnectCallback?(): void;
}

interface WCState {
  chainId: number;
  showModal: boolean;
  pendingRequest: boolean;
  uri: string;
  accounts: string[];
  address: string;
  result: any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  accountAssets: WCAssetData[];
}

const INITIAL_STATE: WCState = {
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: '',
  accounts: [],
  address: '',
  result: null,
  accountAssets: [],
};

const WALLET_CONNECT_BRIDGE = 'https://bridge.walletconnect.org';

const apiGetAccountAssets = async (address: string, chainId: number): Promise<WCAssetData[]> => {
  console.log('asdasd');
  const response = await fetch(`https://ethereum-api.xyz/account-assets?address=${address}&chainId=${chainId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const {
    data: { result },
  } = await response.json();
  console.log(result);
  return result;
};

const useWalletConnect = ({ onConnectCallback }: UseWalletConnectProps) => {
  const [connector, setConnector] = useState<WalletConnect | null>(null);
  const [walletConnectState, setWalletConnectState] = useState<WCState>(INITIAL_STATE);
  const [isConnected, setConnected] = useState(false);

  const [loading, setLoading] = useState(false);

  const resetWalletConnect = useCallback(() => {
    setConnector(null);

    setWalletConnectState(INITIAL_STATE);

    setConnected(false);
    setLoading(false);
  }, []);

  const getAccountAssets = useCallback(async () => {
    if (!walletConnectState) {
      return;
    }

    const { address, chainId } = walletConnectState;

    setLoading(true);

    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId);

      setLoading(false);
      setWalletConnectState(prev => ({
        ...prev,
        accountAssets: assets,
      }));
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [walletConnectState]);

  const onSessionUpdate = useCallback(
    async (accounts: string[], chainId: number) => {
      const address = accounts[0];

      setWalletConnectState(prev => ({
        ...prev,
        chainId,
        address,
        accounts,
      }));

      await getAccountAssets();
    },
    [getAccountAssets],
  );

  const onConnect = useCallback(
    async (payload: WCInternalEvent) => {
      const { chainId, accounts } = payload.params[0];
      const address = accounts[0];

      setConnected(true);
      setWalletConnectState(prev => ({
        ...prev,
        chainId,
        address,
        accounts,
      }));

      await getAccountAssets();

      if (onConnectCallback) {
        onConnectCallback();
      }
    },
    [onConnectCallback, getAccountAssets],
  );

  const onDisconnect = useCallback(() => {
    resetWalletConnect();
  }, [resetWalletConnect]);

  const subscribeToEvents = useCallback(
    async (connectorInstance: WalletConnect) => {
      if (!connectorInstance) {
        return;
      }

      connectorInstance.on('session_update', async (error, payload) => {
        console.info('connector.on("session_update")');

        if (error) {
          throw error;
        }

        const { chainId, accounts } = payload.params[0];
        await onSessionUpdate(accounts, chainId);
      });

      connectorInstance.on('connect', (error, payload) => {
        console.info('connector.on("connect")');

        if (error) {
          throw error;
        }

        onConnect(payload);
      });

      connectorInstance.on('disconnect', error => {
        console.info('connector.on("disconnect")');

        if (error) {
          throw error;
        }

        onDisconnect();
      });

      if (connectorInstance.connected) {
        const { chainId, accounts } = connectorInstance;
        const address = accounts[0];

        setConnected(true);
        setWalletConnectState(prev => ({
          ...prev,
          chainId,
          address,
          accounts,
        }));

        onSessionUpdate(accounts, chainId);
      }

      setConnector(connectorInstance);
    },
    [onConnect, onDisconnect, onSessionUpdate],
  );

  const disconnectWC = useCallback(async () => {
    if (connector?.connected) {
      try {
        connector.killSession();
      } catch (err) {
        // do nothing
      }
    }
    resetWalletConnect();
  }, [connector, resetWalletConnect]);

  const connectWC = useCallback(async () => {
    try {
      await disconnectWC();

      const connectInstance = new WalletConnect({ bridge: WALLET_CONNECT_BRIDGE, qrcodeModal: QRCodeModal });

      if (!connectInstance.connected) {
        // create new session
        console.log('!!');
        console.log(connectInstance.connected);
        console.log(connectInstance);
        await connectInstance.createSession();
      }

      // subscribe to events
      await subscribeToEvents(connectInstance);
    } catch (err) {
      console.log(err);
    }
  }, [disconnectWC, subscribeToEvents]);

  useEffect(() => {
    const connectInstance = new WalletConnect({ bridge: WALLET_CONNECT_BRIDGE, qrcodeModal: QRCodeModal });
    if (connectInstance.connected) {
      subscribeToEvents(connectInstance);
    }

    return () => {
      if (connector) {
        try {
          connector.killSession();
        } catch (err) {
          // do nothing
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    walletConnector: connector,
    isWalletConnected: isConnected,
    loading,
    connectWC,
    disconnectWC,
    walletConnectState,
  };
};

export default useWalletConnect;
