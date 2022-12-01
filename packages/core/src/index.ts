import querystring from 'query-string';
import { QubicConnectConfig } from './types/QubicConnect';
import { QubicConnect } from './QubicConnect';

export * from './types';

function initialize(config: QubicConnectConfig): QubicConnect {
  return new QubicConnect(config);
}

const utils = {
  querystring,
};

export { QubicConnect, initialize, utils };
