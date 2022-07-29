import { FunctionComponent } from 'preact';
import SvgQubicLogo from '../components/icons/QubicLogo';
import SvgMetamaskFox from '../components/icons/MetamaskFox';
import SvgWalletconnectCircleBlue from '../components/icons/WalletconnectCircleBlue';
import { ExtendedExternalProviderMethod } from '../types';

export const EXTERNAL_PROVIDER_MAP: Record<
  ExtendedExternalProviderMethod,
  {
    displayName: string;
    IconComponent?: FunctionComponent<{ className: string }>;
  }
> = {
  qubic: {
    displayName: 'Qubic Wallet',
    IconComponent: SvgQubicLogo,
  },
  metamask: {
    displayName: 'MetaMask',
    IconComponent: SvgMetamaskFox,
  },
  walletconnect: {
    displayName: 'WalletConnect',
    IconComponent: SvgWalletconnectCircleBlue,
  },
  custom: {
    displayName: 'Custom',
  },
};
