import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { randomBytes } from 'crypto';
import prisma from '../prismaClient.js';

const generateUniqueUsername = async (base) => {
    for (let i = 0; i < 5; i++) {
        const candidate = i === 0 ? base : `${base}-${randomBytes(3).toString('hex')}`;
        const exists = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
        if (!exists) return candidate;
    }
    return `${base}-${Date.now()}`;
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4001/api/v1/auth/google/callback',
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

            if (!user) {
                const username = await generateUniqueUsername(profile.displayName);
                user = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        username,
                        email: profile.emails[0].value.toLowerCase(),
                        profilePic: profile.photos[0].value,
                        status: 'ACTIVE',
                    },
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));
