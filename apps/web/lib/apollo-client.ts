import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  let token = '';
  let userId = '';
  if (typeof window !== 'undefined' && (window as any).Clerk) {
    try {
      token = await (window as any).Clerk.session?.getToken() || '';
      userId = (window as any).Clerk.user?.id || '';
    } catch (e) {
      console.error("Failed to get Clerk token/user:", e);
    }
  }

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {})
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
