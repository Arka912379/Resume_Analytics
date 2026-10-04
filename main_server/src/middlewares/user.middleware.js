import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAuth } from "firebase-admin/auth";
import app from "../configs/firebaseAdmin.js";

const verifyUser = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    const firebaseToken = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    const cookieToken = req.cookies?.authToken;
    console.log(cookieToken)
    let email;

    // Firebase authentication gets priority
    if (firebaseToken) {
        try {
            const decoded = await getAuth(app).verifyIdToken(
                firebaseToken
            );

            email = decoded.email;
        } catch (error) {
            throw new ApiError(
                401,
                "Invalid or expired Firebase token"
            );
        }
    }

    // Fall back to JWT cookie
    else if (cookieToken) {
        try {
            const decoded = jwt.verify(
                cookieToken,
                process.env.JWT_SECRET
            );

            email = decoded.email;
        } catch (error) {
            throw new ApiError(
                401,
                "Invalid or expired authentication token"
            );
        }
    }

    // Neither authentication method available
    else {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findOne({ email })
        .select("-password")
        .lean();

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    req.user = user;

    next();
});

export { verifyUser };