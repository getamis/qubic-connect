import { useEffect, useRef } from 'react';
import QubicCreatorSdk from '../../dist';
import './App.css';
import {
  CHAIN_ID,
  INFURA_ID,
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
} from './environment';

const qubicCreatorSdk = new QubicCreatorSdk({
  name: 'Qubic Creator',
  service: 'qubee-creator',
  domain: 'creator.dev.qubic.market',
  key: API_KEY,
  secret: API_SECRET,
  qubicWalletKey: QUBIC_API_KEY,
  qubicWalletSecret: QUBIC_API_SECRET,
  creatorUrl: CREATOR_API_URL,
  chainId: parseInt(CHAIN_ID),
  infuraId: INFURA_ID,
});

function App() {
  const qubicLoginButtonRef = useRef(null);
  const metamaskLoginButtonRef = useRef(null);
  const wcLoginButtonRef = useRef(null);
  const loginWithFullScreenModalButtonRef = useRef(null);
  // const [provider, setProvider] = useState(null);

  const isMountedRef = useRef(false);
  // strict mode caused useEffect called twice
  // https://stackoverflow.com/questions/61254372/my-react-component-is-rendering-twice-because-of-strict-mode/61897567#61897567
  useEffect(() => {
    if (isMountedRef.current === true) {
      return;
    }
    isMountedRef.current = true;
    if (qubicLoginButtonRef?.current) {
      qubicCreatorSdk.createLoginButton(qubicLoginButtonRef.current, {
        method: 'qubic',
        onLogin: (e: any, res: any) => {
          console.log({ accessToken: res.accessToken });
        },
      });
    }
    if (metamaskLoginButtonRef?.current) {
      qubicCreatorSdk.createLoginButton(metamaskLoginButtonRef.current, {
        method: 'metamask',
        onLogin: (e: any, res: any) => {
          console.log({ accessToken: res.accessToken });
        },
      });
    }
    if (wcLoginButtonRef?.current) {
      qubicCreatorSdk.createLoginButton(wcLoginButtonRef.current, {
        method: 'walletconnect',
        onLogin: () => {},
      });
    }
    if (loginWithFullScreenModalButtonRef?.current) {
      qubicCreatorSdk.createCreatorLoginMethodPanel(loginWithFullScreenModalButtonRef.current, {
        methods: ['qubic', 'metamask', 'walletconnect'],
        onLogin: () => {},
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <div ref={qubicLoginButtonRef} className="login-button" />
          <div ref={metamaskLoginButtonRef} className="login-button" />
          <div ref={wcLoginButtonRef} className="login-button" />
          <div ref={loginWithFullScreenModalButtonRef} className="login-button" />
        </div>
      </header>
    </div>
  );
}

export default App;
