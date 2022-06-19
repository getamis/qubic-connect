import { createRoot } from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { LoginMethod } from './auth/useAuth';
import {
  getWeb3Library,
  createCreatorSignInButtonElement,
  CreatorSignInButtonProps,
  SignInFullScreen,
} from './components/LoginPanel';
import { QubicCreatorAuthConfig } from './types/qubicCreator';

const ALLOWED_METHODS: LoginMethod[] = ['qubic', 'metamask', 'wallet_connect'];

export interface CreatorSignInButtonConfig extends CreatorSignInButtonProps {
  method: LoginMethod;

  // titleText: string;
  // containerStyle?: CSSStyleDeclaration;
  // itemStyle?: CSSStyleDeclaration;
  // activeStyleStyle?: CSSStyleDeclaration;
  // backdropStyle?: CSSStyleDeclaration;
}

export interface CreatorSignInPanel extends CreatorSignInButtonProps {
  methods?: LoginMethod[];
}

export class QubicCreator {
  private readonly name: string;
  private readonly service: string;
  private readonly domain: string;
  private readonly key: string;
  private readonly secret: string;
  private _provider: any;

  constructor(config: QubicCreatorAuthConfig) {
    this.name = config.name;
    this.service = config.service;
    this.domain = config.domain;
    this.key = config.key;
    this.secret = config.secret;
  }

  private _getCreatorAuthConfig() {
    return {
      name: this.name,
      service: this.service,
      domain: this.domain,
      key: this.key,
      secret: this.secret,
    };
  }

  public getProvider() {
    return this._provider;
  }

  public createCreatorSignInButton(
    element?: null | HTMLBaseElement,
    config: CreatorSignInButtonConfig = { method: 'qubic' },
  ) {
    if (element) {
      const root = createRoot(element);
      const creatorAuthConfig = this._getCreatorAuthConfig();

      const LoginButton = createCreatorSignInButtonElement({
        method: config.method,
        ...creatorAuthConfig,
      });

      root.render(
        <Web3ReactProvider getLibrary={getWeb3Library}>
          <LoginButton onLogin={config?.onLogin} onLogout={config?.onLogout} />
        </Web3ReactProvider>,
      );
    }
  }

  public createCreatorSignInMethodPanel(
    element?: null | HTMLBaseElement,
    config: CreatorSignInPanel = {
      methods: ALLOWED_METHODS,
    },
  ) {
    if (element) {
      const root = createRoot(element);
      const creatorAuthConfig = this._getCreatorAuthConfig();
      const LoginButtons = config.methods?.map(method => {
        if (!ALLOWED_METHODS.includes(method)) return null;
        const LoginButton = createCreatorSignInButtonElement({
          method,
          ...creatorAuthConfig,
        });
        return <LoginButton />;
      });

      root.render(
        <Web3ReactProvider getLibrary={getWeb3Library}>
          <SignInFullScreen>{LoginButtons}</SignInFullScreen>
        </Web3ReactProvider>,
      );
    }
  }
}
