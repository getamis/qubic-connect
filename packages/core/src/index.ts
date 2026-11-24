import querystring from 'query-string';
import { QubicConnectConfig } from './types/QubicConnectConfig';
import { QubicConnect } from './QubicConnect';

export * from './types';
export * from './constants';
export { parseRedirectUrl } from '@qubic-connect/redirect';

let globalQubicConnect: QubicConnect | null = null;

function initialize(config: QubicConnectConfig): QubicConnect {
  globalQubicConnect = globalQubicConnect || new QubicConnect(config);
  return globalQubicConnect;
}

const utils = {
  querystring,
};

export { QubicConnect, initialize, utils };
