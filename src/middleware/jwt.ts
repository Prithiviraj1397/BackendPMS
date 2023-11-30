import jwt from 'jsonwebtoken';
import { graphqlErrorHandler } from '../utils/graphqlErrorHandler';
import { Auth, Role } from '../models';
import httpStatus from 'http-status';

export const cookieOptions: any = {
    httpOnly: true,
    domain: 'localhost',
    sameSite: 'none',
    secure: true,
};

export const accessTokenCookieOptions: any = {
    ...cookieOptions,
    maxAge: process.env.accessTokenExpireIn || 1 * 3600 * 1000,
    expires: new Date(Date.now() + 1 * 60 * 1000),
};

export const createToken = (payload: any) => {
    return jwt.sign(payload, process.env.JWT_SECRET || "graphql-seceret-key", { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
};

export const validateToken = async (token: string | any) => {
    try {
        const authenticationScheme = 'Bearer ';
        if (token.startsWith(authenticationScheme)) {
            token = token.slice(authenticationScheme.length, token.length);
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET || "graphql-seceret-key");
        return decode;
    } catch (e) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Invalid token')
    }
};

export const validateAuthToken = async (token: string | any) => {
    try {
        const authenticationScheme = 'Bearer ';
        if (token.startsWith(authenticationScheme)) {
            token = token.slice(authenticationScheme.length, token.length);
        }
        const decode: any = jwt.verify(token, process.env.JWT_SECRET || "graphql-seceret-key");
        const findAuth: any = await Auth.findById(decode.id)
        if (findAuth && findAuth.role == "Admin") {
            return true
        }
        return false;
    } catch (e) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Invalid token')
    }
}

export const validateUserToken = async (token: string | any, access: string, permission: String) => {
    try {
        const decode: any = jwt.verify(token, process.env.JWT_SECRET || "graphql-seceret-key");
        if (decode.role == 'User') { return false }
        let roleData: any = await Role.findOne({ role: decode.role })

        if (!checkAccess(roleData.access, access)) { return false; }
        if (!checkPermission(decode.permission, permission)) { return false }

        return decode;
    } catch (e) {
        throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Invalid token')
    }
}

function checkAccess(roleData: { [key: string]: boolean }, acc: string): boolean {
    let access = false;
    Object.keys(roleData).forEach(item => {
        if (item === acc) {
            access = roleData[acc];
        }
    });
    return access;
}

function checkPermission(roleData: String[], permission: String) {
    return roleData.includes(permission)
}