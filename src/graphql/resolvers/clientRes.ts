import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import { Iclient, loginInput, resetMail } from "../../interface/IClient"
import { createToken, validateAuthToken, accessTokenCookieOptions, cookieOptions } from '../../middleware/jwt';
import { saveToken, deleteToken } from '../../common/token';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../../common/mail';
import { Client } from '../../models';
import Validator from 'validator';

//Query Functions
const loginClient = async (_: any, { Input }: { Input: loginInput }, context: any) => {
    const { email, password } = Input;
    const clientData: any = await Client.findOne({ email })
    if (clientData && await clientData.comparePassword(password)) {
        if (!clientData.verified) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Mail Verification Pending');
        }
        const token = createToken({
            _id: clientData._id,
            firstName: clientData.firstName,
            email: clientData.email,
            role: clientData.role,
            access: clientData.access
        })
        //set cookies
        const res: Response = context.res;
        res.cookie('clientToken', token, accessTokenCookieOptions);
        return {
            status: httpStatus.OK,
            message: "Login Success",
            token
        }
    } else {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Invalid email or Password');
    }
}

const logoutClient = async (_: any, { Input }: { Input: loginInput }, context: any) => {
    //remove cookie
    const res: Response = context.res;
    res.clearCookie('clientToken', cookieOptions);
    return {
        status: httpStatus.OK,
        message: "Logout successfully"
    }
}

const getAllClient = async (_: any, { Input }: { Input: Iclient }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        return await Client.find()
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
}

//Mutation Functions
const createClient = async (_: any, { Input }: { Input: Iclient }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        let { email }: any = Input;
        if (!Validator.isEmail(email)) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Please provide valid email')
        }
        let clientData = await Client.findOne({ email });
        if (clientData) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Client Already Exist')
        }
        let info: any = Input;
        info.password = Math.random();
        let newClient = await Client.create(info);
        const expireDate = new Date(new Date().getTime() + 50 * 60000).getTime();
        const token: any = createToken({ userId: newClient._id, userPass: info.password });
        let inviteUrl = `http://localhost:8000/inviteClient?token=${token}`;
        saveToken(token, newClient._id, newClient.email.toString(), expireDate.toString(), 'Invite Client');
        sendEmail(newClient._id.toString(), 'Account Invitation', 'welcomeWithEmailClient', { type: 'client', inviteUrl });
        return {
            status: httpStatus.OK,
            message: `Client has been created successfully`
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized request')
    }
}

const resetClientLink = async (_: any, { Input }: { Input: resetMail }, context: any) => {
    let { email } = Input
    let clientData: any = await Client.findOne({ email });
    if (!clientData) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'CLient Not Found');
    }
    if (clientData.verified) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Your mail has been already verified');
    }
    const expireDate = new Date(new Date().getTime() + 50 * 60000).getTime();
    const token: any = createToken({ userId: clientData._id, userPass: clientData.password });
    let inviteUrl = `http://localhost:8000/inviteClient?token=${token}`;
    saveToken(token, clientData._id, clientData.email.toString(), expireDate.toString(), 'Invite Client')
    sendEmail(clientData._id.toString(), 'Account Invitation', 'welcomeWithEmailClient', { type: 'client', inviteUrl });
    return {
        status: httpStatus.OK,
        message: `Mail has been sent successfully`
    }
}

export default {
    Query: {
        loginClient,
        logoutClient,
        getAllClient,
        resetClientLink
    },
    Mutation: {
        createClient
    }
}