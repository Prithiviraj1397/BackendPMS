import mongoose, { Document } from 'mongoose';

export interface Irole extends Document {
    role: String,
    access: {
        read: boolean,
        write: boolean,
        create: boolean,
    },
    permission: [String],
    createAt: String
}

export interface createRoleInput {
    role: String,
    access: {
        read: boolean,
        write: boolean,
        create: boolean,
    }
}

export interface Pagination {
    limit: Number,
    index: Number
}

export interface addPermission {
    roleId: String,
    permission: [String]
}

export interface updateRoleInput {
    id: String,
    role: String,
    access: {
        read: boolean,
        write: boolean,
        create: boolean,
    },
    permission: [String],
}

export interface IdeleteRole {
    id: mongoose.Types.ObjectId
}