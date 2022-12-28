import querystring from 'query-string';
import { QubicConnectConfig } from './types/QubicConnect';
import { QubicConnect } from './QubicConnect';

export * from './types';

let globalQubicConnect: QubicConnect | null = null;

function initialize(config: QubicConnectConfig): QubicConnect {
  globalQubicConnect = globalQubicConnect || new QubicConnect(config);
  return globalQubicConnect;
}

const utils = {
  querystring,
};

export { QubicConnect, initialize, utils };
