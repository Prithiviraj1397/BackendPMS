import { model, Schema } from 'mongoose';
import { Iauth } from '../../interface/IAuth'
import Validator from 'validator';
import bcrypt from 'bcryptjs';
import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import httpStatus from 'http-status'
import Role from './roleModel';

// const roleEnumFunction = async (value: String) => {
//     const RoleData = await Role.find();
//     const roleEnum: String[] = [];
//     RoleData.map(item => {
//         roleEnum.push(item.role)
//     })
//     return roleEnum.includes(value) ? true : false;
// }

const authSchema: Schema = new Schema({
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
                throw graphqlErrorHandler(httpStatus.BAD_REQUEST, "Please provide valid email")
            }
        },
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    // role: {
    //     type: String,
    //     validate: async (value: any) => {
    //         let v: String = value;
    //         let check = await roleEnumFunction(v);
    //         if (!check) {
    //             throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Please provide valid role')
    //         }
    //     },
    // },
    // roleId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Role',
    //     required: true
    // }
}, { timestamps: true })

authSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

authSchema.methods.comparePassword = async function (enteredPassword: any) {
    return await bcrypt.compare(enteredPassword, this.password);
}

export default model<Iauth>("Admin", authSchema, "Admin")