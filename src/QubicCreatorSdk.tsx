import { render } from 'preact';
import { LoginFullScreen } from './components/LoginPanel';
import { SdkConfig } from './types/QubicCreator';
import { createLoginButtonElement, LoginButtonProps } from './components/LoginButton';
import { ExtendedExternalProvider, ExtendedExternalProviderType } from './types/ExtendedExternalProvider';

const ALLOWED_METHODS: ExtendedExternalProviderType[] = ['qubic', 'metamask', 'walletconnect'];

interface LoginPanelProps extends Omit<LoginButtonProps, 'method'> {
  methods?: ExtendedExternalProviderType[];
}

export class QubicCreatorSdk {
  private readonly config: SdkConfig;
  public provider?: ExtendedExternalProvider;
  public address?: string;
  public accessToken?: string;

  constructor(config: SdkConfig) {
    this.config = config;
  }

  private logoutCallbacks: Array<() => void> = [];
  public createLoginButton(element: HTMLBaseElement, props: LoginButtonProps): void {
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

  public createCreatorLoginMethodPanel(
    element: HTMLBaseElement,
    props: LoginPanelProps = {
      methods: ALLOWED_METHODS,
    },
  ): void {
    const { methods, ...restProps } = props;
    const LoginButtons = methods?.map(method => {
      if (!ALLOWED_METHODS.includes(method)) return null;
      const LoginButton = createLoginButtonElement(this.config);

      return <LoginButton key={method} method={method} {...restProps} />;
    });

    render(<LoginFullScreen>{LoginButtons}</LoginFullScreen>, element);
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