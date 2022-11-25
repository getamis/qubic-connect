import { ComponentChild, render, VNode } from 'preact';
import { createPortal } from 'preact/compat';
import qs from 'query-string';
import { EventEmitter } from 'events';
import { QubicConnectConfig, OnPaymentDone, OnLogin, OnLogout, WalletUser } from './types/QubicConnect';
import LoginButton, { LoginButtonProps } from './components/LoginButton';
import { ExtendedExternalProvider, ProviderOptions } from './types/ExtendedExternalProvider';
import PaymentForm from './components/PaymentForm';
import { Order } from './types';
import LoginModal, { LoginModalProps } from './components/LoginModal/LoginModal';
import App from './components/App';
import { createRequestGraphql, SdkRequestGraphql } from './utils/graphql';
import { API_URL, AUTH_REDIRECT_URL } from './constants/backend';
import { createFetch, SdkFetch } from './utils/sdkFetch';
import { login, logout, LoginRequest, LoginResponse, renewToken, setAccessToken } from './api/auth';
import { Deferred } from './utils/Deferred';
import { isWalletconnectProvider } from './utils/isWalletconnectProvider';

enum Events {
  AuthStateChanged = 'AuthStateChanged',
}

const USER_STORAGE_KEY = '@qubic-connect/user';
const RENEW_TOKEN_BEFORE_EXPIRED_MS = 30 * 60 * 10000;
const CHECK_TOKEN_EXPIRED_INTERVAL_MS = 60 * 1000;

export class QubicConnect {
  private readonly config: QubicConnectConfig;
  private rootDiv: HTMLDivElement;
  private children: Array<ComponentChild> = [];
  private vNodeMap = new Map<HTMLElement, ComponentChild>();
  private authRedirectUrl: string;
  public provider: ExtendedExternalProvider | null = null;
  public address: string | null = null;
  public accessToken: string | null = null;
  public expiredAt: number | null = null;
  private eventEmitter = new EventEmitter();
  private user: WalletUser | null = null;

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

  constructor(config: QubicConnectConfig) {
    this.config = config;
    QubicConnect.checkProviderOptions(config?.providerOptions);
    const { key: apiKey, secret: apiSecret, apiUrl = API_URL, authRedirectUrl = AUTH_REDIRECT_URL } = this.config;
    this.fetch = createFetch({
      apiKey,
      apiSecret,
      apiUrl,
    });
    this.requestGraphql = createRequestGraphql({
      apiKey,
      apiSecret,
      apiUrl,
    });

    this.authRedirectUrl = authRedirectUrl;
    this.rootDiv = document.createElement('div');
    document.body.appendChild(this.rootDiv);

    this.onAuthStateChanged(QubicConnect.persistUser);
    this.handleRedirectResult();
    this.hydrateUser();
  }

  private static persistUser(user: WalletUser | null) {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      const {
        // provider can not be stringify
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        provider,
        ...restUser
      } = user;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(restUser));
    }
  }

  private hydrateUser() {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (!saved) return;
    try {
      const user = JSON.parse(saved) as WalletUser;
      setAccessToken(user.accessToken);
      const provider = this.config.providerOptions?.[user.method]?.provider || null;
      if (provider && isWalletconnectProvider(user.method, provider)) {
        provider.enable();
      }
      this.handleLogin(null, {
        ...user,
        provider,
      });
    } catch (error) {
      // ignore error
      console.warn('can not recover user from localStorage');
    }
  }

  private handleLogin: OnLogin = (error, data) => {
    if (!error && data) {
      this.address = data.address;
      this.accessToken = data.accessToken;
      this.expiredAt = data.expiredAt;
      this.provider = data.provider;
      this.user = data;
      this.eventEmitter.emit(Events.AuthStateChanged, data);
      this.startIntervalToCheckTokenExpired();
    }
  };

  private handleLogout: OnLogout = error => {
    if (!error) {
      this.address = null;
      this.accessToken = null;
      this.expiredAt = null;
      this.provider = null;
      this.eventEmitter.emit(Events.AuthStateChanged, null);
      this.stopIntervalToCheckTokenExpired();
    }
  };

  private checkTokenExpiredIntervalId = 0;
  private startIntervalToCheckTokenExpired() {
    window.clearInterval(this.checkTokenExpiredIntervalId);
    this.checkTokenExpiredIntervalId = window.setInterval(() => {
      if (!this.expiredAt) {
        this.stopIntervalToCheckTokenExpired();
        return;
      }
      const expiresIn = this.expiredAt * 1000 - new Date().getTime();
      if (expiresIn <= RENEW_TOKEN_BEFORE_EXPIRED_MS) {
        this.renewToken();
      }
    }, CHECK_TOKEN_EXPIRED_INTERVAL_MS);
  }

  private stopIntervalToCheckTokenExpired() {
    window.clearInterval(this.checkTokenExpiredIntervalId);
    this.checkTokenExpiredIntervalId = 0;
  }

  private async renewToken(): Promise<void> {
    if (!this.address || !this.expiredAt) {
      return;
    }

    const result = await renewToken(this.fetch);
    const user: WalletUser = {
      method: 'redirect',
      address: this.address,
      accessToken: result.accessToken,
      expiredAt: result.expiredAt,
      provider: null,
    };
    this.handleLogin(null, user);
  }

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

  // public async login() : Promise<LoginResponse> {
  // TODO: ApiProvider
  // }

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
    const removedResultUrl = QubicConnect.removeResultQueryFromUrl(window.location.href);
    const dataString = JSON.stringify({
      name: this.config.name,
      service: this.config.service,
      url: window.location.origin,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });
    window.location.href = qs.stringifyUrl({
      url: `${this.authRedirectUrl}/auth`,
      query: {
        redirectUrl: encodeURIComponent(removedResultUrl),
        dataString: encodeURIComponent(dataString),
      },
    });
  }

  public onAuthStateChanged(callback: (result: WalletUser | null) => void): () => void {
    if (this.user) {
      callback(this.user);
    }
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

    const removedResultUrl = QubicConnect.removeResultQueryFromUrl(window.location.href);
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
      const loginRequest = QubicConnect.getLoginRequestFromUrlAndClearUrl();
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
