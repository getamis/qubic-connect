import { Root } from 'react-dom/client';
// import { GraphQLClient, ClientContext, MiddlewareOptions } from 'graphql-hooks';
// import HmacSHA256 from 'crypto-js/hmac-sha256';
// import Base64 from 'crypto-js/enc-base64';
// import { print } from 'graphql/language/printer';
// import { API_KEY, API_SECRET, QUBIC_CHAIN_ID, QUBIC_INFURA_PROJECT_ID } from '../constants/environment';

import useAuth from '../auth/useAuth';

const LoginPanel = () => {
  const { handleLogin } = useAuth();
  return <button onClick={handleLogin}>Login</button>;
};

// const gqlMiddleware = ({ operation, client }: { operation: any; client: any }, next: () => void) => {
//   console.log(operation);
//   const { operationName, variables, query } = operation;
//   const clientName = '';
//   const clientType = 'public';
//   // console.log(client);
//   const now = Date.now();
//   const urlObj = new URL('https://admin.dev.qubic.market/market/services/graphql-public');
//   const requestURI = `${urlObj.pathname}${urlObj.search}`;
//   const body = query
//     ? JSON.stringify({
//         // operationName,
//         // variables,
//         query,
//       })
//     : undefined;

//   const msg = `${now}POST${requestURI}${body}${clientType}`;
//   const sig = API_SECRET ? HmacSHA256(msg, API_SECRET).toString(Base64) : undefined;
//   console.log(body);
//   if (body) {
//     client.headers['X-Es-Encrypted'] = 'yes';
//   }

//   if (clientName) {
//     client.headers['X-Es-Client-Name'] = clientName;
//   }

//   const headers = {
//     // CORS
//     'sec-fetch-dest': 'empty',
//     'sec-fetch-mode': 'cors',
//     'sec-fetch-site': 'cross-site',
//     // API Key
//     'X-Es-Api-Key': API_KEY,
//     'X-Es-Ts': now,
//     'X-Es-Sign': sig,
//   };
//   client.headers = {
//     ...headers,
//     ...client.headers,
//   };
//   next();
// };

export function createLoginPanelComponent(ReactRootElement: Root, { onLogin = () => {} }) {
  // const creatorGQLClient = new GraphQLClient({
  //   url: 'https://admin.dev.qubic.market/market/services/graphql-public',
  //   middleware: [
  //     gqlMiddleware,
  //     (p, next) => {
  //       console.log(p);
  //       next();
  //     },
  //   ],
  // });

  ReactRootElement.render(
    // <ClientContext.Provider value={creatorGQLClient}>
    <LoginPanel />,
    // </ClientContext.Provider>,
  );
}
