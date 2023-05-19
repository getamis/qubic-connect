import { ComponentChild, render, VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { EventEmitter } from 'events';
import { RedirectAuthManager, LoginRedirectWalletType, QubicSignInProvider } from '@qubic-connect/redirect';
import { showBlockerWhenIab, openExternalBrowserWhenLineIab } from '@qubic-connect/detect-iab';

import { ResponsePassToConnect } from '@qubic-connect/redirect/src/utils';
import {
  QubicConnectConfig,
  InternalQubicConnectConfig,
  OnLogin,
  OnLogout,
  WalletUser,
  BindTicketResult,
  Credential,
} from './types/QubicConnect';
import LoginButton, { LoginButtonProps } from './components/LoginButton';
import {
  ExtendedExternalProvider,
  ExtendedExternalProviderMethod,
  ProviderOptions,
} from './types/ExtendedExternalProvider';
import { SdkFetchError } from './types';
import LoginModal, { LoginModalProps } from './components/LoginModal/LoginModal';
import App from './components/App';
import { createRequestGraphql, SdkRequestGraphql } from './utils/graphql';
import { API_URL, AUTH_REDIRECT_URL, CHECKOUT_API_URL } from './constants/backend';
import { createFetch, SdkFetch } from './utils/sdkFetch';
import { login, logout, loginWithCredential as apiLoginWithCredential, renewToken, setAccessToken } from './api/auth';
import { Deferred } from './utils/Deferred';
import { isWalletconnectProvider } from './utils/isWalletconnectProvider';
import { getMe } from './api/me';
import { createSignMessageAndLogin } from './utils/signMessageAndLogin';
import { AssetBuyInput, AssetBuyOptions, GiftRedeemInput, GiftRedeemOptions } from './types/Asset';
import { buyAsset, BuyAssetResponse, giftRedeem, GiftRedeemResponse } from './api/assets';
import { addLocaleToUrl } from './utils/addLocaleToUrl';

const DEFAULT_SERVICE_NAME = 'qubic-creator';

enum Events {
  AuthStateChanged = 'AuthStateChanged',
  BindTicketResult = 'BindTicketResult',
}

const USER_STORAGE_KEY = '@qubic-connect/user';
const RENEW_TOKEN_BEFORE_EXPIRED_MS = 30 * 60 * 1000;
const CHECK_TOKEN_EXPIRED_INTERVAL_MS = 60 * 1000;
const AUTH_APP_URL = typeof window === 'undefined' ? '' : window.location.origin;

export class QubicConnect {
  private readonly config: InternalQubicConnectConfig;
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
  public checkoutRequestGraphql: SdkRequestGraphql;

  constructor(config: QubicConnectConfig) {
    const {
      name,
      service = DEFAULT_SERVICE_NAME,
      key: apiKey,
      secret: apiSecret,
      apiUrl = API_URL,
      checkoutApiUrl = CHECKOUT_API_URL,
      authRedirectUrl = AUTH_REDIRECT_URL,
      disableIabWarning = false,
      iabRedirectUrl = window.location.href,
      shouldAlwaysShowCopyUI = false,
      disableOpenExternalBrowserWhenLineIab = false,
    } = config;
    if (!apiKey) {
      throw Error('new QubicConnect should have key');
    }
    if (!apiSecret) {
      throw Error('new QubicConnect should have secret');
    }
    this.config = {
      name,
      service,
      key: apiKey,
      secret: apiSecret,
      apiUrl,
      checkoutApiUrl,
      authRedirectUrl,
      providerOptions: config.providerOptions,
      disableIabWarning,
      iabRedirectUrl,
      shouldAlwaysShowCopyUI,
      disableOpenExternalBrowserWhenLineIab,
    };

    QubicConnect.checkProviderOptions(config?.providerOptions);

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

    this.checkoutRequestGraphql = createRequestGraphql({
      apiKey,
      apiSecret,
      apiUrl: checkoutApiUrl,
      isForcingApiUrl: true,
    });

    this.authRedirectUrl = authRedirectUrl;
    this.rootDiv = document.createElement('div');
    document.body.appendChild(this.rootDiv);

    if (!disableOpenExternalBrowserWhenLineIab) {
      openExternalBrowserWhenLineIab();
    }

    if (!disableIabWarning) {
      showBlockerWhenIab({
        redirectUrl: iabRedirectUrl,
        shouldAlwaysShowCopyUI,
      });
    }

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
      if (QubicConnect.ifTokenExpired(user.expiredAt)) {
        this.handleLogout(null);
      } else {
        this.handleLogin(null, {
          ...user,
          provider,
        });
      }
    } catch (error) {
      // ignore error
      console.warn('can not recover user from localStorage');
    }
  }

  private handleUserPurge() {
    localStorage.removeItem(USER_STORAGE_KEY);
    this.address = null;
    this.accessToken = null;
    this.expiredAt = null;
    this.provider = null;
    this.user = null;
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
    if (error) {
      this.eventEmitter.emit(Events.AuthStateChanged, null, error);
    }
  };

  private handleLogout: OnLogout = error => {
    this.handleUserPurge();
    this.eventEmitter.emit(Events.AuthStateChanged, null, error);
    this.stopIntervalToCheckTokenExpired();
  };

  private static ifTokenExpired(expiredAt: number): boolean {
    const expiresIn = expiredAt * 1000 - new Date().getTime();
    const result = expiresIn <= RENEW_TOKEN_BEFORE_EXPIRED_MS;
    return result;
  }

  private checkTokenExpiredIntervalId = 0;
  private startIntervalToCheckTokenExpired() {
    window.clearInterval(this.checkTokenExpiredIntervalId);
    this.checkTokenExpiredIntervalId = window.setInterval(() => {
      if (!this.expiredAt) {
        this.stopIntervalToCheckTokenExpired();
        return;
      }
      if (QubicConnect.ifTokenExpired(this.expiredAt)) {
        this.renewToken().catch(error => {
          console.error(error);
          this.stopIntervalToCheckTokenExpired();
          this.handleLogout(null);
        });
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
      // use previous qubicUser
      qubicUser: this.user?.qubicUser || null,
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

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      this.handleLogout(null);
    }
  }

  public async loginWithWallet(
    method: Exclude<ExtendedExternalProviderMethod, 'redirect'>,
    qubicSignInProvider?: QubicSignInProvider,
  ): Promise<WalletUser> {
    const option = this.config.providerOptions?.[method];
    if (!option) {
      throw Error(`providerOption.${method} not found`);
    }

    const { provider: optionProvider } = option;
    if (!optionProvider) {
      throw Error(`optionProvider not found`);
    }

    if (optionProvider.isQubic && qubicSignInProvider) {
      optionProvider.setSignInProvider?.(qubicSignInProvider);
      optionProvider.off?.('accountsChanged', this.handleAccountsChanged.bind(this));
      optionProvider.on?.('accountsChanged', this.handleAccountsChanged.bind(this));
    }
    const signMessageAndLogin = createSignMessageAndLogin(this.fetch, {
      authAppName: this.config.name,
      authAppUrl: AUTH_APP_URL,
      authServiceName: this.config.service,
    });
    try {
      if (isWalletconnectProvider(method, optionProvider)) {
        // https://github.com/WalletConnect/walletconnect-monorepo/issues/747
        await optionProvider.enable();
      }
      const { accessToken, expiredAt, address } = await signMessageAndLogin(method, optionProvider);
      const result: WalletUser = {
        method,
        accessToken,
        expiredAt,
        address,
        provider: optionProvider,
        qubicUser: null,
      };

      this.handleLogin(null, result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        this.handleLogin(error);
      }
      throw error;
    }
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
  public loginWithRedirect(options?: {
    walletType: LoginRedirectWalletType;
    qubicSignInProvider?: QubicSignInProvider;
  }): void {
    const dataString = JSON.stringify({
      name: this.config.name,
      service: this.config.service,
      url: window.location.origin,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });
    const { createUrlRequestConnectToPass, cleanResponsePassToConnect } = RedirectAuthManager.connect;
    const redirectUrl = cleanResponsePassToConnect(window.location.href);
    window.location.href = createUrlRequestConnectToPass(this.authRedirectUrl, {
      walletType: options?.walletType,
      qubicSignInProvider: options?.qubicSignInProvider,
      redirectUrl,
      dataString,
    });
  }

  public bindWithRedirect(options?: {
    walletType: LoginRedirectWalletType;
    qubicSignInProvider?: QubicSignInProvider;
  }): void {
    const dataString = JSON.stringify({
      name: this.config.name,
      service: this.config.service,
      url: window.location.origin,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });
    const { createUrlRequestConnectToPass, cleanResponsePassToConnect } = RedirectAuthManager.connect;
    const redirectUrl = cleanResponsePassToConnect(window.location.href);
    window.location.href = createUrlRequestConnectToPass(this.authRedirectUrl, {
      walletType: options?.walletType,
      qubicSignInProvider: options?.qubicSignInProvider,
      redirectUrl,
      dataString,
      action: 'bind',
    });
  }

  public onAuthStateChanged(callback: (result: WalletUser | null, error?: SdkFetchError) => void): () => void {
    if (typeof this.cachedRedirectResult !== 'undefined') {
      // the purpose of callback here is let developer can
      // get result immediately when bind this event
      // if everything is ready
      callback(this.user);
    }
    this.eventEmitter.addListener(Events.AuthStateChanged, callback);
    return () => {
      this.eventEmitter.removeListener(Events.AuthStateChanged, callback);
    };
  }

  private cachedRedirectResult?: WalletUser | null;
  private cachedRedirectError?: Error;

  private cachedBindTicket?: BindTicketResult;
  public onBindTicketResult(callback: (result: BindTicketResult | null, error?: SdkFetchError) => void): () => void {
    if (typeof this.cachedBindTicket !== 'undefined') {
      // the purpose of callback here is let developer can
      // get result immediately when bind this event
      // if everything is ready
      callback(this.cachedBindTicket);
    }
    this.eventEmitter.addListener(Events.BindTicketResult, callback);
    return () => {
      this.eventEmitter.removeListener(Events.BindTicketResult, callback);
    };
  }

  private static getRedirectResultFromUrlAndClearUrl(): ResponsePassToConnect | null {
    const currentLocation = window.location.href;
    const parsedQuery = RedirectAuthManager.connect.getResponsePassToConnect(currentLocation);

    const cleanedUrl = RedirectAuthManager.connect.cleanResponsePassToConnect(currentLocation);
    window.history.replaceState(window.history.state, '', cleanedUrl);

    if (!parsedQuery) {
      return null;
    }

    if ('errorMessage' in parsedQuery) {
      throw Error(parsedQuery.errorMessage);
    }

    return parsedQuery;
  }

  private async handleRedirectResult(): Promise<void> {
    try {
      const responsePassToConnect = QubicConnect.getRedirectResultFromUrlAndClearUrl();
      if (responsePassToConnect === null) {
        this.cachedRedirectResult = null;
        this.pendingGetRedirectResultDeferred.forEach(deferred => {
          deferred.resolve(null);
        });
        return;
      }

      if ('errorMessage' in responsePassToConnect) {
        throw Error(responsePassToConnect.errorMessage);
      }

      if (responsePassToConnect.action === 'bind') {
        this.cachedBindTicket = {
          bindTicket: responsePassToConnect.bindTicket,
          expiredAt: responsePassToConnect.expiredAt,
        };
        this.eventEmitter.emit(Events.BindTicketResult, this.cachedBindTicket);
        return;
      }

      const authResponse = await login(this.fetch, responsePassToConnect);
      const {
        me: { qubicUser },
      } = await getMe(this.requestGraphql);

      const user: WalletUser = {
        method: 'redirect',
        address: responsePassToConnect.accountAddress,
        accessToken: authResponse.accessToken,
        expiredAt: authResponse.expiredAt,
        provider: null,
        qubicUser,
      };
      this.handleLogin(null, user);
      this.cachedRedirectResult = user;
      this.pendingGetRedirectResultDeferred.forEach(deferred => {
        deferred.resolve(user);
      });
      return;
    } catch (error) {
      this.cachedRedirectResult = null;
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
    if (typeof this.cachedRedirectResult !== 'undefined') {
      return this.cachedRedirectResult;
    }
    if (this.cachedRedirectError) {
      throw this.cachedRedirectError;
    }
    const deferred = new Deferred<WalletUser | null>();
    this.pendingGetRedirectResultDeferred.push(deferred);
    return deferred.promise;
  }

  public getCurrentUser(): WalletUser | null {
    return this.user;
  }

  public async loginWithCredential(credential: Credential): Promise<WalletUser> {
    const authResponse = await apiLoginWithCredential(this.fetch, credential);
    const {
      me: { qubicUser },
    } = await getMe(this.requestGraphql);

    const user: WalletUser = {
      method: 'redirect',
      address: credential.address,
      accessToken: authResponse.accessToken,
      expiredAt: authResponse.expiredAt,
      provider: null,
      qubicUser,
    };

    return user;
  }

  // eslint-disable-next-line class-methods-use-this
  public async buyAssetAndCreateCheckout(
    assetBuyInput: AssetBuyInput,
    options?: AssetBuyOptions,
  ): Promise<BuyAssetResponse | null> {
    try {
      const response = await buyAsset(this.checkoutRequestGraphql, assetBuyInput);

      let { paymentUrl } = response.assetBuy;

      if (options?.locale) {
        paymentUrl = addLocaleToUrl(response.assetBuy.paymentUrl, options.locale);
      }

      return {
        ...response,
        assetBuy: {
          ...response.assetBuy,
          paymentUrl,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }

    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  public async giftRedeem(
    giftRedeemInput: GiftRedeemInput,
    options?: GiftRedeemOptions,
  ): Promise<GiftRedeemResponse | null> {
    try {
      const response = await giftRedeem(this.checkoutRequestGraphql, giftRedeemInput);

      let { paymentUrl } = response.giftRedeem;

      if (options?.locale) {
        paymentUrl = addLocaleToUrl(response.giftRedeem.paymentUrl, options.locale);
      }

      return {
        ...response,
        giftRedeem: {
          ...response.giftRedeem,
          paymentUrl,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }

    return null;
  }
}
