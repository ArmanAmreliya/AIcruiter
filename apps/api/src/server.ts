import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import dotenv from 'dotenv';

dotenv.config();

const typeDefs = `#graphql
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello, AIcruiter V2 API!',
  },
};

const startServer = async () => {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });

  await apollo.start();

  await fastify.register(fastifyApollo(apollo));

  fastify.get('/health', async () => {
    return { status: 'OK' };
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
