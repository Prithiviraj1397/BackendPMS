import { Document } from 'mongoose';

export interface Isite extends Document {
    site: String,
    siteName: String,
    siteUrl: String,
    phone: String,
    address: String
}

export interface createSiteInput {
    site: String,
    siteName: String,
    siteUrl: String,
    phone: String,
    address: String,
}