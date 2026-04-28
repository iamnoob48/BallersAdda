import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../prismaClient.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/v1/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists in the database
            let user = await prisma.user.findUnique({
                where: { googleId: profile.id }
            });
            //check if username already exists
            let username = profile.displayName;
            if (await prisma.user.findUnique({ where: { username } })) {
                username = username + Math.floor(Math.random() * 1000);
            }

            if (!user) {
                // If not, create a new user
                user = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        username: username,
                        email: profile.emails[0].value,
                        profilePic: profile.photos[0].value,
                        status: 'ACTIVE'
                    }
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }

    }))

//For serializing the user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//For deserializing the user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});