import { ComponentChild, render, VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { QubicCreatorConfig, OnPaymentDone, OnLogin, OnLogout } from './types/QubicCreator';
import LoginButton, { LoginButtonProps } from './components/LoginButton';
import { ExtendedExternalProvider, ProviderOptions } from './types/ExtendedExternalProvider';
import PaymentForm from './components/PaymentForm';
import { Order } from './types';
import LoginModal, { LoginModalProps } from './components/LoginModal/LoginModal';
import App from './components/App';

export class QubicCreatorSdk {
  private readonly config: QubicCreatorConfig;
  private rootDiv: HTMLDivElement;
  private children: Array<ComponentChild> = [];
  private vNodeMap = new Map<HTMLElement, ComponentChild>();
  public provider: ExtendedExternalProvider | null = null;
  public address: string | null = null;
  public accessToken: string | null = null;

  private static checkProviderOptions(providerOptions: ProviderOptions): void {
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

  constructor(config: QubicCreatorConfig) {
    this.config = config;
    QubicCreatorSdk.checkProviderOptions(config.providerOptions);

    this.rootDiv = document.createElement('div');
    document.body.appendChild(this.rootDiv);
  }

  private handleLogin: OnLogin = (error, data) => {
    if (!error && data) {
      this.accessToken = data.accessToken;
      this.provider = data.provider;
      this.address = data.address;
    }
  };

  private handleLogout: OnLogout = error => {
    if (!error) {
      this.accessToken = null;
      this.provider = null;
      this.address = null;
    }
  };

  private forceUpdate(): void {
    render(
      <App key="app" config={this.config} onLogin={this.handleLogin} onLogout={this.handleLogout}>
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
}
