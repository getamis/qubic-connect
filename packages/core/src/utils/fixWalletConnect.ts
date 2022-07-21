// We don't need WalletConnect remember last session here
// use this before first  new WalletConnectProvider

// https://github.com/WalletConnect/walletconnect-monorepo/issues/315
// https://github.com/WalletConnect/walletconnect-monorepo/issues/394

window.localStorage.removeItem('walletconnect');
window.localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');

export {};
