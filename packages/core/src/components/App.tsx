import { ComponentChildren } from 'preact';
import { memo } from 'preact/compat';
import { OnLogin, OnLogout, InternalQubicConnectConfig } from '../types';
import { SdkRequestGraphql } from '../utils/graphql';
import { SdkFetch } from '../utils/sdkFetch';
import { ApiContextProvider } from './ApiProvider';

interface Props {
  children?: ComponentChildren;
  config: InternalQubicConnectConfig;
  sdkFetch: SdkFetch;
  sdkRequestGraphql: SdkRequestGraphql;
  onLogin: OnLogin;
  onLogout: OnLogout;
}

const App = memo<Props>(props => {
  const { sdkFetch, sdkRequestGraphql, config, children, onLogin, onLogout } = props;
  return (
    <ApiContextProvider
      sdkFetch={sdkFetch}
      sdkRequestGraphql={sdkRequestGraphql}
      config={config}
      onLogin={onLogin}
      onLogout={onLogout}
    >
      {children}
    </ApiContextProvider>
  );
});

export default App;
