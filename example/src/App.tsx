import React, { useEffect, useRef } from 'react';
import { QubicCreator } from './sdk/index';
import './App.css';

const qubicCreator = new QubicCreator({
  name: '',
  service: '',
  domain: '',
  key: 'xxx',
  secret: 'xxx',
});

function App() {
  const loginPanelRef = useRef(null);

  useEffect(() => {
    if (loginPanelRef?.current) {
      qubicCreator.createLoginPanel(loginPanelRef.current);
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
