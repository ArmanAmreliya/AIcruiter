import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  let userId = '';
  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('-auth-token')) {
        try {
          const session = JSON.parse(localStorage.getItem(key) || '{}');
          userId = session?.user?.id || '';
          if (userId) break;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  return {
    headers: {
      ...headers,
      'x-user-id': userId,
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
