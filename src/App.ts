import { createRoot } from 'react-dom/client';
export interface QubicCreatorAuthConfig {
  key: string;
  secret: string;
}

export interface CreatorLogin {
  type: 'metamask' | 'wallet_connect' | 'qubic';
  address: string;
  accessToken: string;
  errorMessage: string;
  provider: string; //ether.js
}

export interface createCreatorSignInButtonConfig {
  onLogin: (param: CreatorLogin) => void;
  onLogout: () => void;
  titleText: string;
  containerStyle?: CSSStyleDeclaration;
  itemStyle?: CSSStyleDeclaration;
  activeStyleStyle?: CSSStyleDeclaration;
  backdropStyle?: CSSStyleDeclaration;
}

const LoginPanel = () => <div>test</div>;

export class QubicCreator {
  private readonly key: string;
  private readonly secret: string;
  private _provider: any;
  constructor(config: QubicCreatorAuthConfig) {
    this.key = config.key;
    this.secret = config.secret;
  }
  public getProvider() {
    return this._provider;
  }

  public createCreatorSignInButton(element?: null | HTMLBaseElement, config?: createCreatorSignInButtonConfig) {
    if (element) {
      const root = createRoot(element);
      root.render(<LoginPanel />);
    }
  }
}
