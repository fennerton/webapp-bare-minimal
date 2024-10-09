import express from "express";
import passport from "passport";
import { authRequired } from "../middleware/auth-required.middleware";

const router = express.Router();

router.get("/ping", authRequired, async (_, res) => {
  res.sendStatus(200);
});

router.post("/login", async (req, res, next) => {
  passport.authenticate(
    "local",
    (err: any, user: Express.User, info: { status: number; message: any }) => {
      if (err) {
        return next(err); // Forward the error to the next middleware
      }
      if (!user) {
        return res.status(info.status).json({ message: info.message }); // Custom error response for failed authentication
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err); // Forward the error to the next middleware
        }
        res.status(200).json(user); // Send the user object upon successful authentication
      });
    },
  )(req, res, next);
});

router.post("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

export default router;
