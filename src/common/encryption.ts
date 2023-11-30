import CryptoJS from "crypto-js";
import bcrypt from 'bcryptjs';

const aesKey = CryptoJS.enc.Utf8.parse('aeskeyaeskeyaeskeyaeskeyaeskey32');
const aesIv = CryptoJS.enc.Utf8.parse('0123456789abcdef');
const aesOptions = {
    iv: aesIv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
};

export const encrypt = (plaintext: string) => {
    const ciphertext = CryptoJS.AES.encrypt(plaintext, aesKey, aesOptions).ciphertext.toString();
    return ciphertext
}

export const decrypt = (ciphertext: string) => {
    const encoded: any = { ciphertext: CryptoJS.enc.Hex.parse(ciphertext) };
    const decodedText = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encoded, aesKey, aesOptions));
    return decodedText
}

export const encryptPassword = async (password: string) => {
    return bcrypt.hash(password, 10);
}

export const comparePassword = async (password: any, encrypetdPassward: any) => {
    return bcrypt.compare(password, encrypetdPassward);
}