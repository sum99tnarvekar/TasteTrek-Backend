import express from "express";
import { userLogin , userSignup } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post('/register', userSignup);
userRouter.post('/login', userLogin);

export default userRouter;