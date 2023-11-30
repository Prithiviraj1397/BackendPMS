import mongoose, { model, Schema } from 'mongoose';
import { Itoken } from '../../interface/IToken'

const tokenSchema: Schema = new Schema(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        expires: {
            type: Number,
            // required: true,
        },
        type: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export default model<Itoken>("Token", tokenSchema, "Token")