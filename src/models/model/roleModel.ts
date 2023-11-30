import mongoose, { model, Schema } from 'mongoose';
import { Irole } from '../../interface/IRole';

const postSchema: Schema = new Schema({
    role: {
        type: String,
        unique: true,
        index: true,
        require: true
    },
    access: {
        read: {
            type: Boolean,
            require: true
        },
        write: {
            type: Boolean,
            require: true
        },
        create: {
            type: Boolean,
            require: true
        }
    },
    permission: {
        type: [String],
        default: []
    }

}, { timestamps: true })

export default model<Irole>("Role", postSchema, "Role")