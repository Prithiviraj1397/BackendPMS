import mongoose, { ConnectOptions } from 'mongoose';
const DB_URL: string = process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/graphqlTask';

export const connect = () => {

    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions);

    mongoose.connection.once("open", async () => {
        console.log("MongoDB connected successfully");
    });

    mongoose.connection.on('error', (err: any) => {
        console.log("Mongoose.connection ERR:", err)
        return process.exit(1);
    })

}