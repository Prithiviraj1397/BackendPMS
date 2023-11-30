import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import { loginInput, createAuthInput, Pagination, createUserInput } from '../../interface/IAuth';
import catchAsync from '../../utils/catchAsync';
import { createToken, accessTokenCookieOptions, validateAuthToken, cookieOptions } from '../../middleware/jwt';
import httpStatus from 'http-status';
import { saveToken } from '../../common/token';
import { sendEmail } from '../../common/mail';
import { Auth, Role, User } from '../../models';
import Validator from 'validator';
import { Request, Response, NextFunction } from 'express';

//Query Functions
const loginAuth = async (_: any, { Input }: { Input: loginInput }, context: any) => {
    const { email, password } = Input;
    const authData: any = await Auth.findOne({ email })
    if (authData && await authData.comparePassword(password)) {
        const token = createToken({
            id: authData._id,
            username: authData.username,
            email,
            role: authData.role
        });
        //set cookies
        const res: Response = context.res;
        res.cookie('adminToken', token, accessTokenCookieOptions);
        return {
            status: httpStatus.OK,
            message: "Login Success",
            token
        }
    } else {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, "Invalid Email or Password");
    }
}

const logoutAuth = async (_: any, { Input }: { Input: loginInput }, context: any) => {
    const res: Response = context.res;
    res.clearCookie('adminToken', cookieOptions);
    return {
        status: httpStatus.OK,
        message: "Logout successfully"
    }
}

const getAllAuth = catchAsync(async (_: any, { Input }: { Input: Pagination }, context: any) => {
    const { limit, index }: any = Input;
    const startIndex = (index - 1) * limit;
    const authData: any = await Auth.find().skip(startIndex).limit(limit);
    return authData
})

//Mutation Functions
const createAuth = async (_: any, { Input }: { Input: createAuthInput }) => {
    const { password, confirmPassword } = Input;
    if (password != confirmPassword) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Password & Confirm Password must be same')
    }
    const newAdmin = await Auth.create(Input);
    return {
        status: httpStatus.CREATED,
        message: 'Admin data created successfully!',
        data: newAdmin
    }
}

const inviteUserWithMail = async (_: any, { Input }: { Input: createUserInput }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        let { role, email }: any = Input;
        if (!Validator.isEmail(email)) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Please provide valid email')
        }
        let userData = await User.findOne({ email });
        if (userData) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'UserAlready Exist')
        }
        const roleData = await Role.findOne({ role });
        if (!roleData) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Role Does not Exists')
        }
        let info: any = Input;
        info.roleId = roleData._id;
        info.password = Math.random();
        let newUser = await User.create(info);
        const expireDate = new Date(new Date().getTime() + 50 * 60000).getTime();
        const token: any = createToken({ userId: newUser._id, expireDate, userPass: info.password });
        let inviteUrl = `http://localhost:8000/inviteUser?token=${token}`;
        saveToken(token, newUser._id, newUser.email.toString(), expireDate.toString(), 'Invite User');
        sendEmail(newUser._id.toString(), 'Account Invitation', 'welcomeWithEmail', { inviteUrl })
        return {
            status: httpStatus.OK,
            message: `Invitatiom mail sent successfully`
        }

    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized request')
    }
}

export default {
    Query: {
        loginAuth,
        getAllAuth,
        logoutAuth,
    },
    Mutation: {
        createAuth,
        inviteUserWithMail
    },
}