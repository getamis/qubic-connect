import {
  createUrlRequestConnectToPass,
  RequestConnectToPass,
  RequestPassToWallet,
  createUrlRequestPassToWallet,
  ResponseWalletToPassSuccess,
  createUrlResponseWalletToPass,
  getRequestConnectToPass,
  getRequestPassToWallet,
  getResponseWalletToPass,
  createUrlResponsePassToConnect,
  getResponsePassToConnect,
  ResponseFail,
  createUrlResponseWalletToPassOrConnect,
  cleanResponsePassToConnect,
  cleanResponseWalletToPass,
  ResponsePassToConnectSuccess,
  ResponsePassToConnectFail,
} from './utils';

const MOCK_EXPIRED_AT = 1683601793;

describe('utils', () => {
  test('createUrlRequestConnectToPass', () => {
    const RequestConnectToPass: RequestConnectToPass = {
      action: 'login',
      walletType: 'qubic',
      qubicSignInProvider: 'google',
      redirectUrl: 'https://www.mydapp.com',
      dataString: JSON.stringify({ foo: 1, bar: 2 }),
    };
    const targetUrl = createUrlRequestConnectToPass('https://pass.qubic.app', RequestConnectToPass);
    expect(targetUrl).toBeDefined();

    const result = getRequestConnectToPass(targetUrl);
    expect(result).toEqual(RequestConnectToPass);
  });

  test('createUrlRequestConnectToPass - bind', () => {
    const requestConnectToPass: RequestConnectToPass = {
      walletType: 'qubic',
      qubicSignInProvider: 'google',
      redirectUrl: 'https://www.mydapp.com',
      dataString: JSON.stringify({ foo: 1, bar: 2 }),
      clientTicket: 'mockClientTicket',
      action: 'bind',
    };
    const targetUrl = createUrlRequestConnectToPass('https://pass.qubic.app', requestConnectToPass);
    expect(targetUrl).toBeDefined();

    const result = getRequestConnectToPass(targetUrl);
    expect(result).toEqual(requestConnectToPass);
  });

  test('createUrlRequestPassToWallet', () => {
    const RequestPassToWallet: RequestPassToWallet = {
      ticketRedirectUrl: 'https://pass.qubic.app',
      provider: 'google',
    };
    const targetUrl = createUrlRequestPassToWallet('https://wallet.qubic.app', RequestPassToWallet);
    expect(targetUrl).toBeDefined();

    const result = getRequestPassToWallet(targetUrl);
    expect(result).toEqual(RequestPassToWallet);
  });

  test('createUrlRequestPassToWallet - incorrect url', () => {
    const result = getRequestPassToWallet('https://pass.qubic.app');
    expect(result).toEqual(undefined);
  });

  test('createUrlResponseWalletToPassOrConnect - utils incorrect url', () => {
    const result = createUrlResponseWalletToPassOrConnect('https://pass.qubic.app', {
      ticket: 'mockTicket',
      expiredAt: MOCK_EXPIRED_AT,
      address: 'mockAddress',
    });
    expect(result).toEqual(`https://pass.qubic.app?address=mockAddress&expiredAt=${MOCK_EXPIRED_AT}&ticket=mockTicket`);
  });

  test('createUrlResponseWalletToPassOrConnect - utils errorMessage', () => {
    const result = createUrlResponseWalletToPassOrConnect(
      'https://pass.qubic.app?errorMessage=hello&redirectUrl=https://myapp.com',
      {
        ticket: 'mockTicket',
        expiredAt: MOCK_EXPIRED_AT,
        address: 'mockAddress',
      },
    );
    expect(result).toEqual(
      'https://pass.qubic.app?address=mockAddress&errorMessage=hello&expiredAt=1683601793&redirectUrl=https%3A%2F%2Fmyapp.com&ticket=mockTicket',
    );
  });

  test('createUrlResponseWalletToPass success', () => {
    const responseWalletToPassSuccess: ResponseWalletToPassSuccess = {
      ticket: 'ticket',
      expiredAt: MOCK_EXPIRED_AT,
      address: '0x123',
    };
    const targetUrl = createUrlResponseWalletToPass('https://pass.qubic.app', responseWalletToPassSuccess);
    expect(targetUrl).toBeDefined();

    const result = getResponseWalletToPass(targetUrl);
    expect(result).toEqual(responseWalletToPassSuccess);

    const cleanedUrl = cleanResponseWalletToPass(targetUrl);
    expect(cleanedUrl).not.toContain('ticket');
    expect(cleanedUrl).not.toContain('expiredAt');
    expect(cleanedUrl).not.toContain('address');
  });

  test('createUrlResponsePassToConnect fail', () => {
    const responseFail: ResponseFail = {
      errorMessage: 'Something Wrong',
    };
    const targetUrl = createUrlResponseWalletToPass('https://pass.qubic.app', responseFail);
    expect(targetUrl).toBeDefined();

    const result = getResponseWalletToPass(targetUrl);
    expect(result).toEqual(responseFail);

    const cleanedUrl = cleanResponseWalletToPass(targetUrl);
    expect(cleanedUrl).not.toContain('errorMessage');
  });

  test('createUrlResponsePassToConnect success', () => {
    const responsePassToConnectSuccess: ResponsePassToConnectSuccess = {
      action: 'login',
      accountAddress: '0x123',
      signature: '0x123',
      dataString: '123',
      isQubicUser: true,
    };
    const targetUrl = createUrlResponsePassToConnect('https://pass.qubic.app', responsePassToConnectSuccess);
    expect(targetUrl).toBeDefined();

    const result = getResponsePassToConnect(targetUrl);
    expect(result).toEqual(responsePassToConnectSuccess);

    const cleanedUrl = cleanResponsePassToConnect(targetUrl);
    expect(cleanedUrl).not.toContain('accountAddress');
    expect(cleanedUrl).not.toContain('signature');
    expect(cleanedUrl).not.toContain('dataString');
    expect(cleanedUrl).not.toContain('isQubicUser');
  });

  test('createUrlResponsePassToConnect success - bind', () => {
    const responsePassToConnectSuccess: ResponsePassToConnectSuccess = {
      action: 'bind',
      bindTicket: 'bindTicket',
      expireTime: '2023-05-22T02:54:27.589Z',
    };
    const targetUrl = createUrlResponsePassToConnect('https://pass.qubic.app', responsePassToConnectSuccess);
    expect(targetUrl).toBeDefined();

    const result = getResponsePassToConnect(targetUrl);
    expect(result).toEqual(responsePassToConnectSuccess);

    const cleanedUrl = cleanResponsePassToConnect(targetUrl);
    expect(cleanedUrl).not.toContain('action');
    expect(cleanedUrl).not.toContain('bindTicket');
    expect(cleanedUrl).not.toContain('expiredAt');
  });

  test('getResponsePassToConnect - when not detect any valid params', () => {
    const result = getResponsePassToConnect('https://www.mydapp.com');

    expect(result).toBeNull();
  });

  test('createUrlResponsePassToConnect fail - utils', () => {
    const responseFail: ResponsePassToConnectFail = {
      action: 'login',
      errorMessage: 'Something Wrong',
    };
    const targetUrl = createUrlResponsePassToConnect('https://pass.qubic.app', responseFail);
    expect(targetUrl).toBeDefined();

    const result = getResponsePassToConnect(targetUrl);
    expect(result).toEqual(responseFail);

    const cleanedUrl = cleanResponsePassToConnect(targetUrl);
    expect(cleanedUrl).not.toContain('errorMessage');
  });
});

describe('real world', () => {
  test('full flow', () => {
    let url = 'https://www.mydapp.com';

    // code connect sdk, dApp
    // console.log('--- Qubic Connect SDK ---');
    // console.log(url);
    url = createUrlRequestConnectToPass('https://pass.qubic.app', {
      action: 'login',
      walletType: 'qubic',
      qubicSignInProvider: 'google',
      redirectUrl: url,
      dataString: JSON.stringify({ foo: 1, bar: 2 }),
    });

    // code in pass
    const params1 = getRequestConnectToPass(url);
    // console.log('--- Qubic Pass ---');
    // console.log(url);
    // console.log(params1);

    if (!params1?.qubicSignInProvider) {
      throw Error('qubicSignInProvider not exists');
    }

    url = createUrlRequestPassToWallet('https://wallet.qubic.app', {
      ticketRedirectUrl: url,
      provider: params1.qubicSignInProvider,
    });

    // wallet
    const params2 = getRequestPassToWallet(url);
    // console.log('--- Qubic Wallet ---');
    // console.log(url);
    // console.log(params2);
    if (!params2) {
      throw Error('invalid params');
    }
    url = createUrlResponseWalletToPass(params2.ticketRedirectUrl, {
      ticket: 'mockTicket',
      expiredAt: MOCK_EXPIRED_AT,
      address: 'mockAddress',
    });

    // pass
    const params3 = getResponseWalletToPass(url);
    const ticketParams = getRequestConnectToPass(params2.ticketRedirectUrl);
    // console.log('--- Qubic Pass ---');
    // console.log(url);
    // console.log(params3);
    if ('errorMessage' in params3) {
      throw Error(params3.errorMessage);
    }
    if (!ticketParams?.redirectUrl) {
      throw Error('redirectUrl not found');
    }
    if (!ticketParams?.dataString) {
      throw Error('dataString not found');
    }

    const isQubicUser = true;
    url = createUrlResponsePassToConnect(ticketParams.redirectUrl, {
      accountAddress: params3.address,
      signature: params3.ticket,
      dataString: ticketParams.dataString,
      isQubicUser,
    });

    // code connect sdk, dApp
    const params4 = getResponsePassToConnect(url);
    // console.log('--- Qubic Connect SDK ---');
    // console.log(url);
    // console.log(params4);
    expect(params4).toEqual({
      action: 'login',
      accountAddress: 'mockAddress',
      signature: 'mockTicket',
      dataString: '{"foo":1,"bar":2}',
      isQubicUser: true,
    });
  });

  test('skip pass response flow', () => {
    let url = 'https://www.mydapp.com';
    // code connect sdk, dApp
    // console.log('--- Qubic Connect SDK ---');
    // console.log(url);
    url = createUrlRequestConnectToPass('https://pass.qubic.app', {
      action: 'login',
      walletType: 'qubic',
      qubicSignInProvider: 'google',
      redirectUrl: url,
      dataString: JSON.stringify({ foo: 1, bar: 2 }),
    });

    // code in pass
    const params1 = getRequestConnectToPass(url);
    // console.log('--- Qubic Pass ---');
    // console.log(url);
    // console.log(params1);

    if (!params1?.qubicSignInProvider) {
      throw Error('qubicSignInProvider not found');
    }

    url = createUrlRequestPassToWallet('https://wallet.qubic.app', {
      ticketRedirectUrl: url,
      provider: params1.qubicSignInProvider,
    });

    // wallet
    const params2 = getRequestPassToWallet(url);
    // console.log('--- Qubic Wallet ---');
    // console.log(url);
    // console.log(params2);

    if (!params2) {
      throw Error('invalid params');
    }

    url = createUrlResponseWalletToPassOrConnect(params2.ticketRedirectUrl, {
      ticket: 'mockTicket',
      expiredAt: MOCK_EXPIRED_AT,
      address: 'mockAddress',
    });

    // code connect sdk, dApp
    const params3 = getResponsePassToConnect(url);
    // console.log('--- Qubic Connect SDK ---');
    // console.log(url);
    // console.log(params3);

    expect(params3).toEqual({
      action: 'login',
      accountAddress: 'mockAddress',
      signature: 'mockTicket',
      dataString: '{"foo":1,"bar":2}',
      isQubicUser: true,
    });
  });

  test('full flow - bind', () => {
    let url = 'https://www.mydapp.com';

    // code connect sdk, dApp
    // console.log('--- Qubic Connect SDK ---');
    // console.log(url);
    url = createUrlRequestConnectToPass('https://pass.qubic.app', {
      walletType: 'qubic',
      qubicSignInProvider: 'google',
      redirectUrl: url,
      dataString: JSON.stringify({ foo: 1, bar: 2 }),
      clientTicket: 'mockClientTicket',
      action: 'bind',
    });

    // code in pass
    const params1 = getRequestConnectToPass(url);
    // console.log('--- Qubic Pass ---');
    // console.log(url);
    // console.log(params1);

    if (!params1?.qubicSignInProvider) {
      throw Error('qubicSignInProvider not exists');
    }

    url = createUrlRequestPassToWallet('https://wallet.qubic.app', {
      ticketRedirectUrl: url,
      provider: params1.qubicSignInProvider,
    });

    // wallet
    const params2 = getRequestPassToWallet(url);
    // console.log('--- Qubic Wallet ---');
    // console.log(url);
    if (!params2) {
      throw Error('invalid params');
    }
    url = createUrlResponseWalletToPass(params2.ticketRedirectUrl, {
      ticket: 'mockTicket',
      expiredAt: MOCK_EXPIRED_AT,
      address: 'mockAddress',
    });

    // pass
    const params3 = getResponseWalletToPass(url);
    const ticketParams = getRequestConnectToPass(params2.ticketRedirectUrl);
    // console.log('--- Qubic Pass ---');
    // console.log(url);
    // console.log(params3);
    if ('errorMessage' in params3) {
      throw Error(params3.errorMessage);
    }
    if (!ticketParams?.redirectUrl) {
      throw Error('redirectUrl not found');
    }
    if (!ticketParams?.dataString) {
      throw Error('dataString not found');
    }

    if (ticketParams.action !== 'bind') {
      throw Error('should be bind action');
    }

    url = createUrlResponsePassToConnect(ticketParams.redirectUrl, {
      action: ticketParams.action,
      bindTicket: 'mockedBindTicket',
      expireTime: '2023-05-22T02:54:27.589Z',
    });

    // code connect sdk, dApp
    const params4 = getResponsePassToConnect(url);

    // console.log('--- Qubic Connect SDK ---');
    // console.log(url);
    // console.log(params4);
    expect(params4).toEqual({
      bindTicket: 'mockedBindTicket',
      expireTime: '2023-05-22T02:54:27.589Z',
      action: 'bind',
    });
  });
});
