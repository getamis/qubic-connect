import { DocumentNode, OperationDefinitionNode, parse, print } from 'graphql';
import request, { RequestDocument } from 'graphql-request';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

import { getAccessToken } from '../api/auth';

function extractOperationName(document: DocumentNode): string | undefined {
  let operationName;

  const operationDefinitions = document.definitions.filter(
    definition => definition.kind === 'OperationDefinition',
  ) as OperationDefinitionNode[];

  if (operationDefinitions.length === 1) {
    operationName = operationDefinitions[0].name?.value;
  }

  return operationName;
}

function resolveRequestDocument(document: RequestDocument): { query: string; operationName?: string } {
  if (typeof document === 'string') {
    let operationName;

    try {
      const parsedDocument = parse(document);
      operationName = extractOperationName(parsedDocument);
    } catch (err) {
      // Failed parsing the document, the operationName will be undefined
    }

    return { query: document, operationName };
  }

  const operationName = extractOperationName(document);

  return { query: print(document), operationName };
}

type BuilderInput = {
  serviceUrl: string;
  httpMethod: 'POST' | 'GET';
  apiKey: string;
  apiSecret: string;
  graphQLQuery: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any;
};

function graphqlHeaderBuilder({
  serviceUrl,
  httpMethod = 'POST',
  apiKey,
  apiSecret,
  graphQLQuery,
  variables,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
BuilderInput): any {
  const headers: HeadersInit = {};

  const accessToken = getAccessToken();

  const now = Date.now();
  const urlObj = new URL(serviceUrl);

  const requestURI = `${urlObj.pathname}${urlObj.search}`;

  const { operationName, query } = resolveRequestDocument(graphQLQuery);
  const body =
    operationName && query
      ? JSON.stringify({
          query,
          variables,
          operationName,
        })
      : undefined;

  const msg = `${now}${httpMethod}${requestURI}${body}`;
  const sig = apiSecret ? HmacSHA256(msg, apiSecret).toString(Base64) : undefined;

  if (body) {
    headers['X-Es-Encrypted'] = 'yes';
  }

  if (accessToken) {
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return {
    // CORS
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    // API Key
    'X-Es-Api-Key': apiKey,
    'X-Es-Ts': now.toString(),
    'X-Es-Sign': sig,
    ...headers,
  };
}

interface RequestGraphqlInput {
  query: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any;
  apiKey: string;
  apiSecret: string;
  creatorUrl?: string;
  isPublic?: boolean;
}

export function requestGraphql({
  query,
  variables,
  apiKey,
  apiSecret,
  creatorUrl,
  isPublic = false,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
RequestGraphqlInput): Promise<any> {
  const endPoint = `${creatorUrl}/services/graphql-${isPublic ? 'public' : 'acc'}`;

  const headers = graphqlHeaderBuilder({
    serviceUrl: endPoint,
    httpMethod: 'POST',
    apiKey,
    apiSecret,
    graphQLQuery: query,
    variables,
  });

  return request({
    url: endPoint,
    document: query,
    variables,
    requestHeaders: headers,
  });
}
