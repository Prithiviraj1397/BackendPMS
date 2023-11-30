import { Document } from "mongoose"

export interface Iauth extends Document {
    username: String,
    email: String,
    password: String,
}

export interface loginInput {
    email: String,
    password: String
}

export interface createAuthInput {
    username: String,
    email: String,
    password: String,
    confirmPassword: String,
}

export interface Pagination {
    limit: Number,
    index: Number
}

export interface createUserInput {
    email: String,
    role: String,
    access: [String]
}
