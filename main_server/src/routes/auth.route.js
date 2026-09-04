import expres from "express"
import { sendOtp, verifyOtp } from "../controllers/user.controller.js";

const AuthRouter = expres.Router();


AuthRouter.post("/send-email",sendOtp);
AuthRouter.post("/check-otp",verifyOtp);


export default AuthRouter;