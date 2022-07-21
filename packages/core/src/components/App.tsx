import { ComponentChildren } from 'preact';
import { memo } from 'preact/compat';
import { OnLogin, OnLogout, QubicCreatorConfig } from '../types';
import { ApiContextProvider } from './ApiProvider';

interface Props {
  children?: ComponentChildren;
  config: QubicCreatorConfig;
  onLogin: OnLogin;
  onLogout: OnLogout;
}

const App = memo<Props>(props => {
  const { config, children, onLogin, onLogout } = props;
  return (
    <ApiContextProvider config={config} onLogin={onLogin} onLogout={onLogout}>
      {children}
    </ApiContextProvider>
  );
});

export default App;
