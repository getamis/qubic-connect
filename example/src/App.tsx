import React, { useCallback, useEffect, useRef } from 'react';
import WalletConnect from '@walletconnect/client/dist/cjs';
import QRCodeModal from '@walletconnect/qrcode-modal/dist/cjs';
import QubicCreator from '../../dist';
import './App.css';

const API_KEY = process.env.REACT_APP_CREATOR_API_URL_KEY || '';
const API_SECRET = process.env.REACT_APP_CREATOR_API_URL_SECRET || '';

const qubicCreator = new QubicCreator({
  name: 'Qubic Creator',
  service: 'qubee-creator',
  domain: 'creator.dev.qubic.market',
  key: API_KEY,
  secret: API_SECRET,
});

function App() {
  const qubicLoginButtonRef = useRef(null);
  const metamaskLoginButtonRef = useRef(null);
  const wcLoginButtonRef = useRef(null);
  const loginWithFullScreenModalButtonRef = useRef(null);
  const testConnectWC = useCallback(async () => {
    const connectInstance = new WalletConnect({ bridge: 'https://bridge.walletconnect.org', qrcodeModal: QRCodeModal });
    if (!connectInstance.connected) {
      // create new session
      await connectInstance.createSession();
    }
  }, []);
  // const [provider, setProvider] = useState(null);
  useEffect(() => {
    if (qubicLoginButtonRef?.current) {
      qubicCreator.createCreatorSignInButton(qubicLoginButtonRef.current, {
        method: 'qubic',
        onLogin: (e: any, res: any) => {
          console.log({ accessToken: res.accessToken });
        },
      });
    }
    if (metamaskLoginButtonRef?.current) {
      qubicCreator.createCreatorSignInButton(metamaskLoginButtonRef.current, {
        method: 'metamask',
        onLogin: (e: any, res: any) => {
          console.log({ accessToken: res.accessToken });
        },
      });
    }
    // if (wcLoginButtonRef?.current) {
    //   qubicCreator.createCreatorSignInButton(wcLoginButtonRef.current, {
    //     method: 'wallet_connect',
    //     onLogin: () => {},
    //   });
    // }
    if (loginWithFullScreenModalButtonRef?.current) {
      qubicCreator.createCreatorSignInMethodPanel(loginWithFullScreenModalButtonRef.current, {
        methods: ['qubic', 'metamask'],
        onLogin: () => {},
      });
    }
  }, [qubicLoginButtonRef, metamaskLoginButtonRef, wcLoginButtonRef]);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <div ref={qubicLoginButtonRef} className="login-button" />
          <div ref={metamaskLoginButtonRef} className="login-button" />
          <div ref={wcLoginButtonRef} className="login-button" />
          <div ref={loginWithFullScreenModalButtonRef} className="login-button" />
          <button onClick={testConnectWC} style={{ width: '100px', height: '100px' }} className="login-button">
            WC Test
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
