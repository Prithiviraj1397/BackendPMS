import mongoose, { Document } from 'mongoose';

export interface Itoken extends Document {
    token: String,
    user_id: mongoose.Types.ObjectId,
    expires: Number,
}