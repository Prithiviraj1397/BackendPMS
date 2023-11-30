import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Serialize and deserialize user for session management
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID || '320874480947-k8q5hktsrg38adlt44vvv3e7nbkntb22.apps.googleusercontent.com',
            clientSecret: process.env.CLIENT_SECRET || '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',
            callbackURL: process.env.REDIRECT_URL || 'http://localhost:4500/auth/google/callback',
            //@ts-ignore
            // accessType: 'offline',
        }, async (accessToken: string, idToken: string, profile: any, done: any) => {
            console.log("🚀 ~ file: passport.ts:13 ~ profile:", profile)
            const { sub, name, given_name, family_name, email } = profile._json
            let user = {
                sub, name, given_name, family_name, email
            }
            return done(null, user);
        }))

export default passport;