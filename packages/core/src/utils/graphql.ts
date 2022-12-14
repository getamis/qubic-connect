import { DocumentNode, OperationDefinitionNode, parse, print } from 'graphql';
import { request, RequestDocument } from 'graphql-request';

import { getAccessToken } from '../api/auth';
import serviceHeaderBuilder from './serviceHeaderBuilder';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RequestGraphqlInput<TVariables> {
  query: string;
  variables?: TVariables;
  isPublic?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SdkRequestGraphql<TVariables = any, TResult = any> {
  (input: RequestGraphqlInput<TVariables>): Promise<TResult>;
}

export const createRequestGraphql =
  ({ apiKey, apiSecret, apiUrl }: { apiKey: string; apiSecret: string; apiUrl: string }): SdkRequestGraphql =>
  ({ query, variables, isPublic = false }) => {
    // acc means access token
    const endPoint = `${apiUrl}/services/graphql-${isPublic ? 'public' : 'acc'}`;

    const { operationName, query: graphQLQuery } = resolveRequestDocument(query);
    const body =
      operationName && query
        ? JSON.stringify({
            query: graphQLQuery,
            variables,
            operationName,
          })
        : undefined;

    const headers = serviceHeaderBuilder({
      serviceUri: endPoint,
      httpMethod: 'POST',
      apiKey,
      apiSecret,
      body,
      accessToken: getAccessToken(),
    });

    return request({
      url: endPoint,
      document: query,
      variables,
      requestHeaders: headers,
    });
  };
