import { createRoot } from 'react-dom/client';
import { createLoginPanelComponent } from './LoginPanel';

export interface QubicCreatorAuthConfig {
  name: string;
  service: string;
  domain: string;
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

export interface CreateLoginPanelConfig {
  onLogin: (param: CreatorLogin) => void;
  onLogout: () => void;
  titleText: string;
  containerStyle?: CSSStyleDeclaration;
  itemStyle?: CSSStyleDeclaration;
  activeStyleStyle?: CSSStyleDeclaration;
  backdropStyle?: CSSStyleDeclaration;
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

  public getProvider() {
    return this._provider;
  }

  public createLoginPanel(element?: null | HTMLBaseElement, config?: CreateLoginPanelConfig) {
    if (element) {
      const root = createRoot(element);
      createLoginPanelComponent(root, {
        onLogin: () => {},
      });
    }
  }
}
