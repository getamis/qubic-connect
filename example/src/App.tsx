import React, { useEffect, useRef } from 'react';
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

  // const [provider, setProvider] = useState(null);
  useEffect(() => {
    if (qubicLoginButtonRef?.current) {
      qubicCreator.createCreatorSignInButton(qubicLoginButtonRef.current, {
        method: 'qubic',
        onLogin: () => {},
      });
    }
    if (metamaskLoginButtonRef?.current) {
      qubicCreator.createCreatorSignInButton(metamaskLoginButtonRef.current, {
        method: 'metamask',
        onLogin: () => {},
      });
    }
    if (wcLoginButtonRef?.current) {
      qubicCreator.createCreatorSignInButton(wcLoginButtonRef.current, {
        method: 'wallet_connect',
        onLogin: () => {},
      });
    }
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
        </div>
      </header>
    </div>
  );
}

export default App;
