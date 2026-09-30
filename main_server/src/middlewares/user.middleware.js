import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAuth } from "firebase-admin/auth";
import app from "../configs/firebaseAdmin.js";
const verifyUser = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    const token2 = req.cookies?.authToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(token);
    console.log(token2);
    if (token) {
        const decoded = await getAuth(app).verifyIdToken(token);
        const email = decoded.email;
        const user = await User.findOne({ email }).select('-password').lean();
        if (!user) {
            throw new ApiError(404, 'User not found');

        }
        req.user = user;
        // console.log(decoded);

        next();
    }
    if (token2) {
        const decoded = jwt.verify(token2, process.env.JWT_SERECT)
        console.log(decoded);
        const email = decoded.email;
        const user = await User.findOne({ email }).select('-password').lean();
        if (!user) {
            throw new ApiError(404, 'User not found');

        }
        req.user = user;
        next();
    }

    if (!token && !token2) throw new ApiError(401, "Unauthorized ")


});

export  {verifyUser};