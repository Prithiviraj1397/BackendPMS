import { model, Schema } from 'mongoose';
import { Isite } from '../../interface/ISite'

const siteSchema: Schema = new Schema({
    site: {
        type: String,
        required: true
    },
    siteName: {
        type: String,
        required: true
    },
    siteUrl: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },

}, { timestamps: true })

export default model<Isite>("Site", siteSchema, "Site")