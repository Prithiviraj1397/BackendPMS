import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import { User } from '../../models';
import { Iuser, createUserInput, loginInput, IallUser, deleteUserInput, forgatPasswordUserInput } from '../../interface/IUser';
import mongoose from 'mongoose';
import { createToken, validateUserToken, validateToken, accessTokenCookieOptions, cookieOptions } from '../../middleware/jwt';
import { sendEmail } from '../../common/mail';
import { saveToken, checkToken } from '../../common/token';
import httpStatus from 'http-status';
import Validator from 'validator';
import { Request, Response } from 'express';
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.CLIENT_ID || '320874480947-k8q5hktsrg38adlt44vvv3e7nbkntb22.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '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';
const REDIRECT_URL = process.env.REDIRECT_URL || 'http://localhost:4500/auth/google/callback';
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


//Query Functions
const getAllUser = async (_: any, __: any, context: any): Promise<IallUser> => {
    return await User.find() as unknown as IallUser
}

const getSingleUser = async (_: any, { id }: any): Promise<Iuser> => {
    const Id: any = mongoose.Types.ObjectId.createFromHexString(id);
    const userData = await User.findById(Id);
    if (!userData)
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'User Not Found')

    return userData as unknown as Iuser;
}

const loginUser = async (_: any, { Input }: { Input: loginInput }, context: any) => {
    const { email, password } = Input;
    const userData: any = await User.findOne({ email })
    if (userData && await userData.comparePassword(password)) {
        if (!userData.verified) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Mail Verification Pending');
        }
        const token = createToken({
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            permission: userData.permission
        })
        //set cookies
        const res: Response = context.res;
        res.cookie('userToken', token, accessTokenCookieOptions);
        return {
            status: httpStatus.OK,
            message: "Login Success",
            token
        }
    } else {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Invalid email or Password');
    }
}
const loginWithGoogle = async () => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
        prompt: "select_account",
    });

    return authUrl;
}
const logoutUser = async (_: any, { Input }: { Input: loginInput }, context: any) => {
    //remove cookie
    const res: Response = context.res;
    res.clearCookie('userToken', cookieOptions);
    return {
        status: httpStatus.OK,
        message: "Logout successfully"
    }
}

//Mutation Functions
const createUser = async (_: any, { Input }: { Input: createUserInput }) => {
    const { password, confirmPassword } = Input;
    if (password != confirmPassword) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Password & confirm Password must be same')
    }
    const userData = await User.findOne({ email: Input.email })
    if (userData) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'User Already Exists')
    }
    const newUser = await User.create(Input);
    const expireDate = new Date(new Date().getTime() + 10 * 60000).getTime();
    const token: any = createToken({ userId: newUser._id, expireDate })
    let confirm_url = `http://localhost:8000/verifymail?token=${token}`
    saveToken(token, newUser._id, newUser.email.toString(), expireDate.toString(), 'Verify Mail')
    sendEmail(newUser._id.toString(), 'Confirmation Mail', 'welcome', { confirm_url })
    return {
        status: httpStatus.CREATED,
        message: 'Verification Mail Sent',
        // data: newUser
    }
}

const forgotPassword = async (_: any, { Input }: { Input: forgatPasswordUserInput }) => {
    let { email }: any = Input;
    let UserData = await User.findOne({ email });
    if (UserData) {
        //check token already exists or not
        let tokenExists = await checkToken(UserData._id, 'Reset Password')
        if (tokenExists) {
            return { status: false, message: 'Reset password link has already sent to your email address' }
        }
        //jwt token
        const expireDate = new Date(new Date().getTime() + 10 * 60000).getTime();
        const token: any = createToken({ userId: UserData._id, expireDate })
        const forgetPasswordUrl = `http://localhost:8000/forgetpassword?token=${token}`
        //save token in DB
        saveToken(token, UserData._id, UserData.email.toString(), expireDate.toString(), 'Reset Password')
        // send link to email
        sendEmail(UserData.id, 'Reset Password Request', 'reset_password', { forgetPasswordUrl })
        return {
            status: true,
            message: 'Reset password link has been sent to your email address'
        }
    } else {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Invalid Email Address')
    }
}

const deleteUser = async (_: any, { Input }: { Input: deleteUserInput }, context: any) => {
    const req: any = context.req;
    let { userToken } = req.cookies;
    validateToken(userToken)
    const tokenData: any = userToken != undefined ? await validateUserToken(userToken, 'write', 'User') : false
    if (tokenData) {
        const { id } = Input;
        sendEmail(id.toString(), 'Account Deleted', 'delete', {});
        const deleteData = await User.deleteOne({ _id: id })
        if (deleteData.deletedCount) {
            return {
                status: httpStatus.OK,
                message: 'Role deleted successfully'
            }
        } else {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Role deleted failed');
        }
    } else {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Unauthorized Request')
    }
}

const inviteUser = async (_: any, { Input }: { Input: createUserInput }, context: any) => {
    const req: any = context.req;
    let { userToken } = req.cookies;
    const tokenData: any = userToken != undefined ? await validateUserToken(userToken, 'create', 'User') : false
    if (tokenData) {
        let { email }: any = Input;
        if (!Validator.isEmail(email)) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Please provide valid email')
        }
        let userData = await User.findOne({ email });
        if (userData) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'UserAlready Exist')
        }
        let inviteUrl = `https://studio.apollographql.com/sandbox/explorer`;
        // saveToken(token, newUser._id, newUser.email.toString(), expireDate.toString(), 'Invite User');
        sendEmail(tokenData._id.toString(), 'Account Invitation', 'invite_user', { email, inviteUrl })
        return {
            status: httpStatus.OK,
            message: `User Invitatiom mail sent successfully`
        }

    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized request')
    }
}

export default {
    Query: {
        getAllUser,
        getSingleUser,
        loginUser,
        logoutUser,
        loginWithGoogle
    },
    Mutation: {
        createUser,
        forgotPassword,
        deleteUser,
        inviteUser
    },
}