import mongoose, { Document } from 'mongoose';

export interface Iuser extends Document {
    username: String,
    email: String,
    password: String,
    role: String,
    permission: [String]
}

export interface IallUser {
    name: String,
    email: String,
    password: String,
    role: String,
}

export interface createUserInput {
    name: String,
    email: String,
    password: String,
    confirmPassword: String,
}

export interface loginInput {
    email: String
    password: String
}

export interface deleteUserInput {
    id: mongoose.Types.ObjectId,
}

export interface forgatPasswordUserInput {
    email: String
}