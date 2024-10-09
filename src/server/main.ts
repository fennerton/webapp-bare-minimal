import express from "express";
import ViteExpress from "vite-express";
import * as mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import MongoStore from "connect-mongo";

import { loginVerify } from "./services/authentication.service";
import { Authentication } from "../interfaces/authentication";
import authenticationRoute from "./routes/authentication.route";
import { createLogger, morganMiddleware } from "./middleware/logger.middleware";
import routings from "./routes/routings";

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morganMiddleware);

app.use(
  session({
    secret: process.env.JSON_SIGNATURE || "",
    resave: true,
    saveUninitialized: true,
    rolling: true, // Extend session expiration on each request
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION_STRING }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());

passport.use("local", new Strategy({ usernameField: "login" }, loginVerify));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser<Authentication>((user, done) => {
  done(null, user);
});

app.use("/api", routings);

const logger = createLogger(import.meta.url);

(async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING as string);
    logger.info("MongoDB connected...");
  } catch (err: any) {
    logger.error(err.message);
    process.exit(1);
  }
})();

ViteExpress.listen(app, 3000, () =>
  logger.info("Server is listening on port 3000..."),
);
