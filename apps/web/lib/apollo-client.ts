import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Resolve the API base URL with a clear priority order.
// NEXT_PUBLIC_* vars are baked into the client bundle at build time by Next.js.
// We must NOT rely on window-based detection at module level because:
//   1. The module loads during SSR where window is undefined.
//   2. `${''}/graphql` = '/graphql' which is truthy, so the || fallback never fires.
const resolveApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/graphql$/i, '')}/graphql`;
  }
  // Default to localhost for local development
  return 'http://localhost:4000/graphql';
};

const GRAPHQL_URI = resolveApiUrl();

const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
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

  const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const fallbackUserId = isDev ? 'demo-recruiter-id-123' : '';

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'x-user-id': userId || fallbackUserId || 'demo-recruiter-id-123'
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
