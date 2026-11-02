import {publicOrigin} from "./security";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing required Google OAuth credentials: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
}

export function getSession() {
  if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)throw Error("SESSION_SECRET must contain at least 32 characters.");
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: Math.floor(sessionTtl/1000),
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: publicOrigin()+"/auth/google/callback",
    state: true
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      
      const verification=profile._json as {email_verified?:boolean;verified_email?:boolean};
      if(verification.email_verified!==true&&verification.verified_email!==true)return done(null,false);
      // Upsert user in database
      await storage.upsertUser({
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value || '',
      });

      const user = {
        claims: {
          sub: profile.id,
          email: profile.emails?.[0]?.value || '',
          first_name: profile.name?.givenName || '',
          last_name: profile.name?.familyName || '',
          profile_image_url: profile.photos?.[0]?.value || '',
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7 // 1 week from now
      };

      return done(null, user);
    } catch (error) {
      console.error('Google authentication failed.');
      return done(error, false);
    }
  }));

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Google auth routes  
  app.get('/api/auth/google', (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });

  app.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/',
      successRedirect: '/'
    })(req, res, next);
  });

  // Login route (redirects to Google)
  app.get("/api/login", (req, res) => {
    res.redirect('/api/auth/google');
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    res.set('Content-Security-Policy',"default-src 'none'; form-action 'self'; frame-ancestors 'none'");
    res.type('html').send('<!doctype html><title>Sign out</title><form method="post" action="/api/logout"><button>Sign out</button></form>');
  });
  app.post('/api/logout',(req,res,next)=>{
    req.logout(error=>{
      if(error)return next(error);
      req.session.destroy(error=>{
        if(error)return next(error);
        res.clearCookie('connect.sid',{path:'/'});res.redirect('/');
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  

  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
};