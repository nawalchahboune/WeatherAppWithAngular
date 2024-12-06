import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export function createApollo(): any {
  return {
    cache: new InMemoryCache(),
    uri: 'http://your-graphql-endpoint', // Remplacez par l'URL de votre serveur GraphQL
  };
}

export const APOLLO_PROVIDER = {
  provide: APOLLO_OPTIONS,
  useFactory: createApollo,
};
