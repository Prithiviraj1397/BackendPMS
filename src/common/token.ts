
import { Token } from '../models'
export const saveToken = async (token: string, userId: string, email: string, expires: string, type: string) => {
    const tokenDoc = await Token.create({
        token,
        email,
        userId,
        expires,
        type
    });
    return tokenDoc;
};

export const deleteToken = async (token: string = '', userId: string, type: string) => {
    await Token.deleteMany({ userId, type });
}

export const checkToken = async (userId: string, type: string) => {
    const token: any = await Token.findOne({ userId, type })
    const currentTime = new Date().getTime();
    if (token && currentTime < Number(token.expires)) {
        return true;
    } else {
        await Token.deleteMany({ userId, type })
        return false
    }
}