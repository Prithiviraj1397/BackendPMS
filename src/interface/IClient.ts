import { Document } from "mongoose"

export interface Iclient extends Document {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    phone: String,
    currency: String,
    country: String,
    groups: String,
    label: String,
    address: String
}

export interface loginInput {
    email: String,
    password: String
}
export interface resetMail {
    email: String,
}