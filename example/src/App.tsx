import React, { useState, useEffect, useRef } from 'react';
import { QubicCreator } from './sdk/index';
import './App.css';

const API_KEY = process.env.REACT_APP_CREATOR_API_URL_KEY || '';
const API_SECRET = process.env.REACT_APP_CREATOR_API_URL_SECRET || '';

const qubicCreator = new QubicCreator({
  name: 'Qubic Creator',
  service: 'qubee-creator',
  domain: 'creator.stag.qubic.market',
  key: API_KEY,
  secret: API_SECRET,
});

function App() {
  const loginPanelRef = useRef(null);
  const [provider, setProvider] = useState(null);
  useEffect(() => {
    if (loginPanelRef?.current) {
      qubicCreator.createCreatorSignInButton(loginPanelRef.current, {
        method: 'qubic',
        onLogin: () => {},
      });
    }
  }, [loginPanelRef]);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <div ref={loginPanelRef} className="loginPanel" />
        </div>
      </header>
    </div>
  );
}

export default App;
