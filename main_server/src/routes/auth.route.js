import expres from "express"
import { findUserDataForForgetPassword, forgetPassword, login, register, sendOtp, verifyOtp } from "../controllers/user.controller.js";

const AuthRouter = expres.Router();


AuthRouter.post("/send-email",sendOtp);
AuthRouter.post("/check-otp",verifyOtp);
AuthRouter.post("/login",login);
AuthRouter.post("/register",register);
AuthRouter.post("/find-data-forget",findUserDataForForgetPassword);
AuthRouter.post("/forget-passowrd",forgetPassword);



export default AuthRouter;