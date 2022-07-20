import { render } from 'preact';
import { CSSProperties } from 'preact/compat';
import { LoginPanelModal, LoginPanelModalProps } from './components/LoginPanelModal';
import { QubicCreatorConfig, OnPaymentDone } from './types/QubicCreator';
import { createLoginButtonElement, LoginButtonProps } from './components/LoginButton';
import { ExtendedExternalProvider, ExtendedExternalProviderType } from './types/ExtendedExternalProvider';
import { createPaymentFormElement } from './components/PaymentForm';
import { Order } from './types';

const ALLOWED_METHODS: ExtendedExternalProviderType[] = ['qubic', 'metamask', 'walletconnect'];

export interface LoginPanelProps
  extends Omit<LoginButtonProps, 'method' | 'style'>,
    Omit<LoginPanelModalProps, 'children'> {
  methods?: ExtendedExternalProviderType[];
  itemStyle?: CSSProperties;
}

export class QubicCreatorSdk {
  private readonly config: QubicCreatorConfig;
  public provider?: ExtendedExternalProvider;
  public address?: string;
  public accessToken?: string;

  constructor(config: QubicCreatorConfig) {
    this.config = config;
  }

  private logoutCallbacks: Array<() => void> = [];
  public createLoginButton(element: HTMLElement | null, props: LoginButtonProps): void {
    if (!element) throw Error(`${element} not found`);
    const LoginButton = createLoginButtonElement(this.config);

    const { method, onLogin, onLogout } = props;

    if (onLogout) {
      this.logoutCallbacks.push(onLogout);
    }
    render(
      <LoginButton
        method={method}
        onLogin={(errorMessage, data) => {
          if (!errorMessage && data) {
            this.accessToken = data.accessToken;
            this.provider = data.provider;
            this.address = data.address;
          }
          onLogin?.(errorMessage, data);
        }}
      />,
      element,
    );
  }

  public createLoginPanel(
    element: HTMLElement | null,
    props: LoginPanelProps = {
      methods: ALLOWED_METHODS,
    },
  ): void {
    if (!element) throw Error(`${element} not found`);
    const { methods, onLogin, onLogout, itemStyle, ...restProps } = props;
    const LoginButton = createLoginButtonElement(this.config);

    const LoginButtons = methods?.map(method => {
      if (!ALLOWED_METHODS.includes(method)) return null;
      return <LoginButton key={method} method={method} onLogin={onLogin} onLogout={onLogout} style={itemStyle} />;
    });

    render(<LoginPanelModal {...restProps}>{LoginButtons}</LoginPanelModal>, element);
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
    if (!this.accessToken) {
      throw new Error('Not logged in yet');
    }

    let order: Order | undefined;

    function setOrder(value: Order) {
      order = value;
    }

    function getOrder(): Order | undefined {
      return order;
    }

    const PaymentForm = createPaymentFormElement(this.config);

    render(<PaymentForm getOrder={getOrder} onPaymentDone={props.onPaymentDone} />, element);

    return {
      setOrder,
    };
  }

  public logout(): void {
    this.logoutCallbacks.forEach(logoutCallback => {
      logoutCallback();
    });
    this.logoutCallbacks = [];
    this.accessToken = undefined;
    this.provider = undefined;
    this.address = undefined;
  }
}
