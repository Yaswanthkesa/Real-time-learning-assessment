import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';

// Configure Google OAuth Strategy
export const configurePassport = () => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth credentials not found. Google Sign-In will not be available.');
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;
          const profilePicture = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // User exists - update googleId if not set
            if (!user.googleId) {
              user.googleId = googleId;
              if (profilePicture && !user.profilePicture) {
                user.profilePicture = profilePicture;
              }
              await user.save();
            }
            return done(null, user);
          }

          // New user - create account
          // Note: Role will be set later via a separate endpoint
          user = await User.create({
            name,
            email,
            googleId,
            profilePicture,
            role: 'student', // Default role, can be changed later
          });

          return done(null, user);
        } catch (error: any) {
          return done(error, undefined);
        }
      }
    )
  );

  // Serialize user for session (not used with JWT, but required by passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (not used with JWT, but required by passport)
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  return passport;
};

export default passport;
