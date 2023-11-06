import { ExtendedExternalProvider } from './ExtendedExternalProvider';

declare global {
  interface Window {
    ethereum?: ExtendedExternalProvider;
  }
}

export {};
