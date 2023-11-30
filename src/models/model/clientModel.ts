import { model, Schema } from 'mongoose';
import { Iclient } from '../../interface/IClient';
import Validator from 'validator';
import bcrypt from 'bcryptjs';
import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import httpStatus from 'http-status'

const clientSchema: Schema = new Schema({
    firstName: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate(value: any) {
            if (!Validator.isEmail(value)) {
                throw graphqlErrorHandler(httpStatus.BAD_REQUEST, "Please provide valid email")
            }
        },
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        // required: true
    },
    currency: {
        type: String,
        // required: true
    },
    country: {
        type: String,
        // required: true
    },
    groups: {
        type: String,
        // required: true
    },
    label: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        default: 'Client'
    },
    access: {
        type: [String],
        default: []
    }
}, { timestamps: true, __v: 0 })

clientSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

clientSchema.methods.comparePassword = async function (enteredPassword: any) {
    return await bcrypt.compare(enteredPassword, this.password);
}

export default model<Iclient>("Client", clientSchema, "Client")