import express, { Request, Response, NextFunction, Router } from 'express';
const router: Router = express.Router();
import passport from 'passport';
import { User } from '../models';
import { createToken, validateUserToken, validateToken, accessTokenCookieOptions, cookieOptions } from '../middleware/jwt';
import httpStatus from 'http-status';

router.get("/failed", async (req: Request, res: Response) => {
    res.send("Failed")
})

router.get("/success", async (req: Request, res: Response) => {
    const { email }: any = req.user;
    const userData: any = await User.findOne({ email })
    if (!userData) {
        res.json({

        })
    }
    const token = createToken({
        _id: userData._id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        permission: userData.permission
    })
    res.cookie('userToken', token, accessTokenCookieOptions);
    res.json({
        status: httpStatus.OK,
        message: "Login Success",
        token
    })
})

router.get('/google/signup',
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        prompt: 'select_account',
        accessType: 'offline',
    }));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/failed',
    }),
    function (req, res) {
        res.redirect('/auth/success')
    })

export default router;