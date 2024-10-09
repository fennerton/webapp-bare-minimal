import {RequestHandler} from "express-serve-static-core";

export const authRequired: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // If the user is authenticated, continue to the next middleware/your route handler
  }

  return res.sendStatus(401);
};