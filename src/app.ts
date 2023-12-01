import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/federation';
import { GraphQLSchema } from 'graphql';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginInlineTraceDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Express, Request, Response, NextFunction, } from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs, resolvers } from "./graphql/index";
import { connect } from "./config/db";
import path from 'path';
import { setHttpPlugin } from './utils/setHttpPlugin';
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, '.env') });


const startServer = async () => {
    const app: Express = express();
    const httpServer = http.createServer(app);
    const PORT = process.env.PORT || 8001;
    interface MyContext {
        token?: string;
    }
    const schema: GraphQLSchema = buildSubgraphSchema([{
        typeDefs,
        resolvers,
    } as any]);
    const server = new ApolloServer<MyContext>({
        schema,
        plugins: [ApolloServerPluginInlineTraceDisabled(), setHttpPlugin, ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();
    const corsOptions = {
        origin: process.env.ALLOWEDORIGIN,
        credentials: true,
    }
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(corsOptions),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async ({ req, res }: { req: Request, res: Response }) => {
                const token = req.headers.authorization || '';
                return { req, res, token };
            },
        }),
    );

    connect();

    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
}

startServer(); 