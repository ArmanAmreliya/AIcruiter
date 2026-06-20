import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  let token = '';
  if (typeof window !== 'undefined' && (window as any).Clerk) {
    try {
      token = await (window as any).Clerk.session?.getToken() || '';
    } catch (e) {
      console.error("Failed to get Clerk token:", e);
    }
  }

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
