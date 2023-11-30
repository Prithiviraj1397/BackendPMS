import express, { Request, Response, NextFunction, Router } from 'express';
const router: Router = express.Router();
import fs from 'fs';
import path from 'path';
import { encryptPassword } from '../common/encryption'
import { validateToken } from '../middleware/jwt';
import { deleteToken } from '../common/token';
import { Token, User, Client } from '../models';
import { json2csv } from 'json-2-csv';

// forget password was reset by user
router.post('/forgetpassword', async (req: Request, res: Response) => {
    try {
        const token: any = await Token.findOne({ token: req.query.token });
        const decode: any = await validateToken(token.token);
        const currentTime = new Date().getTime();
        if (currentTime < decode.expireDate) {
            const { password, confirmPassword } = req.body;
            if (password != confirmPassword)
                res.json({ status: false, message: 'Password & Confirm Password must be same' })
            const user: any = await User.findById(decode.userId)
            Object.assign(user, { password });
            await user.save();
            deleteToken(token.token, user._id, token.type)
            res.json({ status: true, message: 'Password was changed successfully' })
        } else {
            res.json({ status: false, message: 'Link expired' })
        }
    } catch (e) {
        res.sendFile(path.join(__dirname, '../templates/404.html'))
        // res.json({ status: false, message: 'Something went wrong' })
    }
})

//Invite user by admin
router.post('/inviteUser', async (req: Request, res: Response) => {
    try {
        const token: any = await Token.findOne({ token: req.query.token });
        const decode: any = await validateToken(token.token);
        const currentTime = new Date().getTime();
        const userData: any = await User.findById(decode.userId);
        if (userData && await userData.comparePassword(decode.userPass.toString()) && currentTime < decode.expireDate) {
            let { password } = req.body;
            req.body.password = await encryptPassword(password.toString());
            req.body.verified = true;
            const userData = await User.updateOne({ _id: decode.userId }, req.body);
            deleteToken(token.token, token.userId, token.type)
            res.json({ status: true, message: 'User data updated successfully!' });
        } else {
            deleteToken(token.token, token.userId, token.type)
            res.json({ status: false, message: 'Link expired' })
        }
    } catch (e) {
        console.log("🚀 ~ file: userRouter.ts:49 ~ router.post ~ e:", e)
        res.sendFile(path.join(__dirname, '../templates/404.html'))
        // res.json({ status: false, message: 'Something went wrong' })
    }
})

//Invite client by admin
router.post('/inviteClient', async (req: Request, res: Response) => {
    try {
        const token: any = await Token.findOne({ token: req.query.token });
        const decode: any = await validateToken(token.token);
        // const currentTime = new Date().getTime();
        const clientData: any = await Client.findById(decode.userId);
        if (clientData && !clientData.verified) {
            let { password } = req.body;
            req.body.password = await encryptPassword(password.toString());
            req.body.verified = true;
            const updateClient = await Client.updateOne({ _id: decode.userId }, req.body);
            deleteToken(token.token, token.userId, token.type)
            res.json({ status: true, message: 'Client data updated successfully!' });
        } else {
            // deleteToken(token.token, token.userId, token.type)
            res.sendFile(path.join(__dirname, '../templates/404.html'))
            // res.json({ status: false, message: 'Link expired' })
        }
    } catch (e) {
        console.log("🚀 ~ file: userRouter.ts:49 ~ router.post ~ e:", e)
        res.sendFile(path.join(__dirname, '../templates/404.html'))
        // res.json({ status: false, message: 'Something went wrong' })
    }
})

//user mail verification
router.get('/verifymail', async (req: Request, res: Response) => {
    try {
        // verifymail
        const token: any = await Token.findOne({ token: req.query.token });
        const decode: any = await validateToken(token.token);
        const currentTime = new Date().getTime();
        const userData: any = await User.findById(decode.userId);
        if (userData && currentTime < decode.expireDate) {
            await User.updateOne({ _id: decode.userId }, { verified: true });
            let template = fs.readFileSync(path.join(__dirname, '../templates/verifiedmail.html'), "utf8");
            template = template.replace(new RegExp("\\[verifymail\\]", "g"), userData.email)
            deleteToken(token.token, token.userId, token.type)
            res.send(template);
        } else {
            res.json({ status: false, message: 'Link expired' })
        }
    } catch (e) {
        console.log("🚀 ~ file: userRouter.ts:49 ~ router.post ~ e:", e)
        res.sendFile(path.join(__dirname, '../templates/404.html'))
        // res.json({ status: false, message: 'Something went wrong' })
    }
})

//API TEST
router.get('/First', async (req: Request, res: Response) => {
    const axios = require('axios');

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.scripture.api.bible/v1/bibles?include-full-details=false',
        headers: {
            'accept': 'application/json',
            'api-key': '938f532dcc3be62f24caec3d7933039c'
        }
    };

    axios.request(config)
        .then(async (response: any) => {
            let final: any = [];
            const result = response.data.data;
            result.map((item: any) => {
                let data = {
                    bibleID: item.language.id + '-' + item.id + '-' + item.name,
                    bibleName: item.name,
                    bibleLanguage: item.language.id + item.language.name,
                    bibleCountry: item.countries[0].id + item.countries[0].name
                }
                final.push(data)
            })
            // const folderName = path.join(__dirname, 'data', 'bible');
            // const filename = 'nav_bibles.json';
            // const filePath = path.join(folderName, filename);

            // // Create the "data" folder if it doesn't exist
            // if (!fs.existsSync(folderName)) {
            //     fs.mkdirSync(folderName, { recursive: true });
            // }
            // fs.writeFileSync(filePath, JSON.stringify(final), 'utf8')     

            // let CSV = await json2csv(final)
            // console.log("🚀 ~ file: userRouter.ts:118 ~ .then ~ CSV:", CSV)
            // fs.writeFileSync('data.csv', CSV, 'utf8')
            res.json({ data: final })
        })
        .catch((error: any) => {
            console.log(error);
        });
})
router.get('/Second', async (req: Request, res: Response) => {
    const axios = require('axios');

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.scripture.api.bible/v1/bibles/2ef130d3485d3fe4-01/books?include-chapters=true&include-chapters-and-sections=true',
        headers: {
            'accept': 'application/json',
            'api-key': '938f532dcc3be62f24caec3d7933039c'
        }
    };

    axios.request(config)
        .then((response: any) => {
            let final: any = [];
            const result = response.data.data[0];
            let data = {
                bibleID: result.bibleId,
                bookID: result.id,
                bookName: result.name,
                bookNameLong: result.nameLong,
            }
            result.chapters.map((item: any) => {
                item.number = item.number == 'intro' ? "0" : item.number;
                item.id = item.id.replace("intro", "0");
                let obj = {
                    ...data,
                    chapterID: item.id,
                    chapterNumber: item.number
                }
                final.push(obj)
            })
            res.json({ data: final })
        })
        .catch((error: any) => {
            console.log(error);
        });

})
router.get('/Third', async (req: Request, res: Response) => {
    const axios = require('axios');

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.scripture.api.bible/v1/bibles/2ef130d3485d3fe4-01/passages/MAT.1?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=true&include-verse-numbers=true&include-verse-spans=true&use-org-id=false',
        headers: {
            'accept': 'application/json',
            'api-key': '938f532dcc3be62f24caec3d7933039c'
        }
    };

    axios.request(config)
        .then((response: any) => {
            res.json({ data: response.data.data })
        })
        .catch((error: any) => {
            console.log(error);
        });
})

export default router;