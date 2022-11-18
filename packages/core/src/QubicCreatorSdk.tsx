import { ComponentChild, render, VNode } from 'preact';
import { createPortal } from 'preact/compat';
import qs from 'query-string';
import { EventEmitter } from 'events';
import { QubicCreatorConfig, OnPaymentDone, OnLogin, OnLogout, WalletUser } from './types/QubicCreator';
import LoginButton, { LoginButtonProps } from './components/LoginButton';
import { ExtendedExternalProvider, ProviderOptions } from './types/ExtendedExternalProvider';
import PaymentForm from './components/PaymentForm';
import { Order } from './types';
import LoginModal, { LoginModalProps } from './components/LoginModal/LoginModal';
import App from './components/App';
import { createRequestGraphql, SdkRequestGraphql } from './utils/graphql';
import { CREATOR_API_URL, CREATOR_AUTH_URL } from './constants/backend';
import { createFetch, SdkFetch } from './utils/sdkFetch';
import { login, logout, LoginRequest, LoginResponse } from './api/auth';
import { Deferred } from './utils/Deferred';

enum Events {
  AuthStateChanged = 'AuthStateChanged',
}

export class QubicCreatorSdk {
  private readonly config: QubicCreatorConfig;
  private rootDiv: HTMLDivElement;
  private children: Array<ComponentChild> = [];
  private vNodeMap = new Map<HTMLElement, ComponentChild>();
  private creatorAuthUrl: string;
  public provider: ExtendedExternalProvider | null = null;
  public address: string | null = null;
  public accessToken: string | null = null;
  public expiredAt: number | null = null;
  private eventEmitter = new EventEmitter();

  private static checkProviderOptions(providerOptions?: ProviderOptions): void {
    if (!providerOptions) {
      // no need to check, since no provider options
      return;
    }
    if (providerOptions.qubic) {
      if (!providerOptions.qubic.provider.isQubic) {
        throw Error('qubic only accept Qubic provider');
      }
    }
    if (providerOptions.metamask) {
      if (!providerOptions.metamask.provider) {
        // user did not install metamask
        return;
      }
      if (!providerOptions.metamask.provider.isMetaMask) {
        throw Error('metamask only accept MetaMask provider');
      }
    }

    if (providerOptions.walletconnect) {
      if (!providerOptions.walletconnect.provider.isWalletConnect) {
        throw Error('walletconnect only accept WalletConnect provider');
      }
    }
  }

  public fetch: SdkFetch;
  public requestGraphql: SdkRequestGraphql;

  constructor(config: QubicCreatorConfig) {
    this.config = config;
    QubicCreatorSdk.checkProviderOptions(config?.providerOptions);
    const {
      key: apiKey,
      secret: apiSecret,
      creatorUrl = CREATOR_API_URL,
      creatorAuthUrl = CREATOR_AUTH_URL,
    } = this.config;
    this.fetch = createFetch({
      apiKey,
      apiSecret,
      creatorUrl,
    });
    this.requestGraphql = createRequestGraphql({
      apiKey,
      apiSecret,
      creatorUrl,
    });

    this.creatorAuthUrl = creatorAuthUrl;
    this.rootDiv = document.createElement('div');
    document.body.appendChild(this.rootDiv);

    this.handleRedirectResult();
  }

  private handleLogin: OnLogin = (error, data) => {
    if (!error && data) {
      this.address = data.address;
      this.accessToken = data.accessToken;
      this.expiredAt = data.expiredAt;
      this.provider = data.provider;
      this.eventEmitter.emit(Events.AuthStateChanged, data);
    }
  };

  private handleLogout: OnLogout = error => {
    if (!error) {
      this.address = null;
      this.accessToken = null;
      this.expiredAt = null;
      this.provider = null;
      this.eventEmitter.emit(Events.AuthStateChanged, null);
    }
  };

  private forceUpdate(): void {
    render(
      <App
        key="app"
        sdkFetch={this.fetch}
        sdkRequestGraphql={this.requestGraphql}
        config={this.config}
        onLogin={this.handleLogin}
        onLogout={this.handleLogout}
      >
        {this.children}
      </App>,
      this.rootDiv,
    );
  }

  private renderToChildren(node: VNode, element: HTMLElement) {
    const existingVNode = this.vNodeMap.get(element);
    if (existingVNode) {
      this.children = this.children.map(child => {
        if (child === existingVNode) {
          const newVNode = createPortal(node, element);
          this.vNodeMap.set(element, newVNode);
          return newVNode;
        }
        return child;
      });
    } else {
      const newVNode = createPortal(node, element);
      this.vNodeMap.set(element, newVNode);
      this.children = [...this.children, newVNode];
    }
    this.forceUpdate();
  }

  public createLoginButton(element: HTMLElement | null, props: LoginButtonProps): void {
    if (!element) throw Error(`${element} not found`);

    this.renderToChildren(<LoginButton {...props} />, element);
  }

  public createLoginModal(element: HTMLElement | null, props: LoginModalProps): void {
    if (!element) throw Error(`${element} not found`);

    this.renderToChildren(<LoginModal {...props} />, element);
  }

  public createPaymentForm(
    element: HTMLElement | null,
    props: {
      onPaymentDone: OnPaymentDone;
    },
  ): {
    setOrder: (value: Order) => void;
  } {
    if (!element) throw Error(`${element} not found`);

    let order: Order | undefined;

    function setOrder(value: Order) {
      order = value;
    }

    function getOrder(): Order | undefined {
      return order;
    }

    this.renderToChildren(<PaymentForm getOrder={getOrder} onPaymentDone={props.onPaymentDone} />, element);
    return {
      setOrder,
    };
  }

  private static removeResultQueryFromUrl(currentUrl: string): string {
    const {
      url,
      // remove previous result, key of LoginRequest and errorMessage but keep other query params
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: { accountAddress, signature, dataString, isQubicUser, errorMessage, ...restQuery },
    } = qs.parseUrl(currentUrl);

    const removedResultUrl = qs.stringifyUrl({
      url,
      query: restQuery,
    });
    return removedResultUrl;
  }

  public async logout(): Promise<void> {
    try {
      await logout(this.fetch);
      this.handleLogout(null);
    } catch (error) {
      if (error instanceof Error) {
        this.handleLogout(error);
      }
    }
  }

  /** No any web3 provider will be used, only for get access token  */
  /**
   * 1. loginWithRedirect() will go to auth helper url with `redirectUrl`, `dataString`
   * 2. auth helper url shows Qubic wallet and other wallets
   *    a. Qubic wallet: redirect to Qubic wallet, after user sign in success, get `ticket` from backend
   *    b. Other wallet: sign `dataString` and get `signature`
   * 3. then go to `redirectUrl` with results which includes signature or ticket
   * 4. handleRedirectResult() uses results to get creator access token
   * 5. now user can use fetch() or requestGraphql() to call api
   */
  public loginWithRedirect(): void {
    const removedResultUrl = QubicCreatorSdk.removeResultQueryFromUrl(window.location.href);
    const dataString = JSON.stringify({
      name: this.config.name,
      service: this.config.service,
      url: window.location.origin,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });
    window.location.href = qs.stringifyUrl({
      url: `${this.creatorAuthUrl}/creator-login`,
      query: {
        redirectUrl: encodeURIComponent(removedResultUrl),
        dataString: encodeURIComponent(dataString),
      },
    });
  }

  public onAuthStateChanged(callback: (result: WalletUser | null) => void): () => void {
    this.eventEmitter.addListener(Events.AuthStateChanged, callback);
    return () => {
      this.eventEmitter.removeListener(Events.AuthStateChanged, callback);
    };
  }

  private cachedRedirectResult?: WalletUser;
  private cachedRedirectError?: Error;

  private static getLoginRequestFromUrlAndClearUrl(): LoginRequest | null {
    const { query } = qs.parseUrl(window.location.href);

    const parsedQuery = {
      ...query,
      // isQubicUser need to convert from string to boolean to match type
      isQubicUser: query.isQubicUser === 'true',
    } as LoginRequest | { errorMessage: string };

    const removedResultUrl = QubicCreatorSdk.removeResultQueryFromUrl(window.location.href);
    window.history.replaceState({}, '', removedResultUrl);

    if ('errorMessage' in parsedQuery) {
      throw Error(parsedQuery.errorMessage);
    }
    if (!parsedQuery.signature || !parsedQuery.accountAddress) {
      // not detecting valid query, just skip
      return null;
    }
    return parsedQuery;
  }

  private async handleRedirectResult(): Promise<LoginResponse | null> {
    try {
      const loginRequest = QubicCreatorSdk.getLoginRequestFromUrlAndClearUrl();
      if (loginRequest === null) {
        // not detecting valid query, just skip
        return null;
      }

      const result = await login(this.fetch, loginRequest);
      const user: WalletUser = {
        method: 'redirect',
        address: loginRequest.accountAddress,
        accessToken: result.accessToken,
        expiredAt: result.expiredAt,
        provider: null,
      };
      this.handleLogin(null, user);
      this.cachedRedirectResult = user;
      this.pendingGetRedirectResultDeferred.forEach(deferred => {
        deferred.resolve(user);
      });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        this.handleLogin(error);
        this.cachedRedirectError = error;
        this.pendingGetRedirectResultDeferred.forEach(deferred => {
          deferred.reject(error);
        });
      }
      throw error;
    }
  }

  private pendingGetRedirectResultDeferred: Array<Deferred<WalletUser | null>> = [];
  public async getRedirectResult(): Promise<WalletUser | null> {
    if (this.cachedRedirectResult) {
      return this.cachedRedirectResult;
    }
    if (this.cachedRedirectError) {
      throw this.cachedRedirectError;
    }
    const deferred = new Deferred<WalletUser | null>();
    this.pendingGetRedirectResultDeferred.push(deferred);
    return deferred.promise;
  }
}
