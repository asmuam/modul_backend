import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { prisma } from '../database.js';
import config from '../config.js'; // Your JWT secret configs

// Serialize user to store in session (if you want session-based login)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });
        if (!user) {
          // Create a new user if not found
          user = await prisma.user.create({
            data: {
              username: profile.displayName.replace(/\s+/g, '_').toLowerCase(),
              name: profile.displayName,
              email: profile.emails[0].value,
              password: '', // OAuth users won't have a password
            },
          });
        }

        // Generate JWT tokens
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          config.jwtSecret,
          { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, {
          expiresIn: '30d',
        });

        // Store refresh token in DB
        await prisma.user.update({
          where: { id: user.id },
          data: { refresh_token: refreshToken },
        });

        return done(null, { user, token, refreshToken });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              username: profile.username,
              name: profile.displayName || profile.username,
              email: profile.emails[0].value,
              password: '', // No password for OAuth users
            },
          });
        }

        // Generate JWT tokens
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          config.jwtSecret,
          { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, {
          expiresIn: '30d',
        });

        // Store refresh token in DB
        await prisma.user.update({
          where: { id: user.id },
          data: { refresh_token: refreshToken },
        });

        return done(null, { user, token, refreshToken });
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
