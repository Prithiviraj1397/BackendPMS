import { Document, Schema } from 'mongoose';

export interface Iproject extends Document {
    title: String,
    client: String,
    clientId: Schema.Types.ObjectId,
    startDate: Date,
    deadLine: Date,
    progress:String,
    status:String
}
export interface Pagination {
    limit: Number,
    index: Number
}
