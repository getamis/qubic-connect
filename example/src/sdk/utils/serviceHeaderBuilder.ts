import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

type BuilderInput = {
  serviceUri: string;
  body?: string;
  httpMethod: 'POST' | 'GET';
  apiSecret: string;
  apiKey: string;
  isGQL?: boolean;
};

const serviceHeaderBuilder = ({
  serviceUri,
  body = '',
  httpMethod,
  apiSecret,
  apiKey,
  isGQL = false,
}: BuilderInput) => {
  let headers = {} as Record<string, string | number | boolean>;

  const now = Date.now();
  const urlObj = new URL(serviceUri);
  const requestURI = `${urlObj.pathname}${urlObj.search}`;
  const msg = `${now}${httpMethod}${requestURI}${body}`;
  const sig = apiSecret ? HmacSHA256(msg, apiSecret).toString(Base64) : undefined;

  if (sig) {
    headers['X-Es-Sign'] = sig;
  }

  if (body) {
    headers['X-Es-Encrypted'] = 'yes';
  }

  // CORS
  // only suitable for GQL setting
  if (isGQL) {
    headers['sec-fetch-dest'] = 'empty';
    headers['sec-fetch-mode'] = 'cors';
    headers['sec-fetch-site'] = 'cross-site';
  }

  return {
    // API Key
    'X-Es-Api-Key': apiKey,
    'X-Es-Ts': now,
    ...headers,
  };
};

export default serviceHeaderBuilder;
