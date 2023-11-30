import { model, Schema } from 'mongoose';
import { Iuser } from '../../interface/IUser'
import Validator from 'validator';
import bcrypt from 'bcryptjs';
import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import httpStatus from 'http-status';

const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate(value: any) {
            if (!Validator.isEmail(value)) {
                throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Please provide valid email')
            }
        },
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'User'
    },
    roleId: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    verified: {
        type: Boolean,
        default: false
    },
    permission: {
        type: [String],
        default: []
    }
}, { timestamps: true })

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

UserSchema.methods.comparePassword = async function (enteredPassword: any) {
    return await bcrypt.compare(enteredPassword, this.password);
}

export default model<Iuser>("User", UserSchema, "User")
