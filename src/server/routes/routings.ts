import express from "express";
import authenticationRoute from "./authentication.route";

const router = express.Router();

router.use(authenticationRoute);

export default router;
