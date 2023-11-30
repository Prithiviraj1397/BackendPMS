import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from './logger'
const DB_URL: string = process.env.MONGO_URL ?? 'mongodb://localhost:27017/graphqlTask';

export const connect = () => {
    mongoose.connect(DB_URL);
    console.log("🚀 ~ file: db.ts:8 ~ connect ~ DB_URL:", DB_URL)

    mongoose.connection.once("open", async () => {
        logger.info("MongoDB connected successfully");
    });

    mongoose.connection.on('error', (err: any) => {
        logger.info("Mongoose.connection ERR:", err)
        return process.exit(1);
    })

}