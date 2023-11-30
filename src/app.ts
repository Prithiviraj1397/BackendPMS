import { ApolloServer } from 'apollo-server-express';
import express, { Express, Request, Response, NextFunction } from 'express';
import * as dotenv from "dotenv";
import { connect } from "./config/db";
import path from 'path';
import { typeDefs, resolvers } from "./graphql/index";
import { setHttpPlugin } from './utils/setHttpPlugin';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './router/userRouter';
import gmailSigUp from './router/google';
import { google } from 'googleapis';
import { OAuth2Client } from "google-auth-library";
import { logger } from './config/logger';

// import session from 'express-session';
// import passport from './config/passport';


//dotenv files
dotenv.config({ path: path.join(__dirname, '.env') });

const CLIENT_ID = process.env.CLIENT_ID || '320874480947-k8q5hktsrg38adlt44vvv3e7nbkntb22.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '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';
const REDIRECT_URL = process.env.REDIRECT_URL || 'http://localhost:4500/auth/google/callback';
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const startServer = async () => {
    const app: Express = express();

    app.use(cookieParser());
    const corsOptions = {
        origin: [
            'https://studio.apollographql.com',
            'http://localhost:8000',
            'http://localhost:5000',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))

    app.use(express.json());
    // app.use(session({
    //     secret: process.env.session_secret || 'SECRET',
    //     resave: false,
    //     saveUninitialized: true
    // }));
    // app.use(passport.initialize());
    // app.use(passport.session());
    app.use('/', userRouter)
    // passport google strategy
    // app.use('/', gmailSigUp)

    app.get('/auth/google/callback', async (req, res) => {
        const code: any = req.query.code;
        const tokens: any = await oAuth2Client.getToken(code);
        const idToken = tokens.tokens.id_token;
        await oAuth2Client.setCredentials(tokens);
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID,
        });
        const payload: any = ticket.getPayload();
        res.send('Login successful');
    });

    //graphQL
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        cache: 'bounded',
        context: ({ req, res }: { req: Request, res: Response }) => {
            const token = req.headers.authorization || '';
            return { req, res, token };
        },
        plugins: [setHttpPlugin]
    });

    await server.start();
    
    server.applyMiddleware({
        app,
        path: '/graphql',
        cors: corsOptions
    });

    //DB Connection
    connect();

    app.listen(8000, (): void => {
        logger.info(`Server is running on the Port 8000`)
    });
}

startServer(); 