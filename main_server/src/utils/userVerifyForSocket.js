import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import { getAuth } from "firebase-admin/auth";
import app from "../configs/firebaseAdmin.js";

const verifyUser = async (token, authType) => {
    let email;

    if (authType == "firebase") {
        const decoded = await getAuth(app).verifyIdToken(token);
        console.log(decoded);
        email = decoded.email;
    } else if (authType == "normal") {
        const decoded = jwt.verify(token, process.env.JWT_SERECT)
        console.log(decoded);
        email = decoded.email;
    } else{
        return false;
    }

    const user = await User.findOne({ email }).select("-password").lean();
    if (!user) {
        return false;
    }
    return user;
}

export default verifyUser;