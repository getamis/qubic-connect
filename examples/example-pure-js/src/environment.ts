export const DEBUG = process.env.REACT_APP_DEBUG === 'true';
export const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID) || 1;
export const INFURA_ID = process.env.REACT_APP_INFURA_ID || '';

export const API_SERVICE_NAME = process.env.REACT_APP_API_SERVICE_NAME || '';
export const API_KEY = process.env.REACT_APP_API_KEY || '';
export const API_SECRET = process.env.REACT_APP_API_SECRET || '';
export const API_URL = process.env.REACT_APP_API_URL || '';
export const AUTH_REDIRECT_URL = process.env.REACT_APP_AUTH_REDIRECT_URL || '';

export const MAGIC_LOGIN_LINK_URL = process.env.REACT_APP_MAGIC_LOGIN_LINK_URL || '';
export const MAGIC_LOGIN_WEBSOCKET_URL = process.env.REACT_APP_MAGIC_LOGIN_WEBSOCKET_URL || '';
export const QUBIC_API_KEY = process.env.REACT_APP_QUBIC_API_KEY || '';
export const QUBIC_API_SECRET = process.env.REACT_APP_QUBIC_API_SECRET || '';

export const VERIFY_URL = process.env.REACT_APP_VERIFY_URL || '';
