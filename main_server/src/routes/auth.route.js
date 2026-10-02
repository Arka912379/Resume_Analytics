import expres from "express"
import { findUserDataForForgetPassword, forgetPassword, getUserData, login, register, sendOtp, verifyOtp } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/user.middleware.js";

const AuthRouter = expres.Router();


AuthRouter.post("/send-email",sendOtp);
AuthRouter.post("/check-otp",verifyOtp);
AuthRouter.post("/login",login);
AuthRouter.post("/register",register);
AuthRouter.post("/find-data-forget",findUserDataForForgetPassword);
AuthRouter.post("/forget-passowrd",forgetPassword);
AuthRouter.post("/getuser",verifyUser,getUserData);



export default AuthRouter;