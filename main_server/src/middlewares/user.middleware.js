import jwt from "jsonwebtoken"
import admin from "firebase-admin";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
dotenv.config()
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_DOMAIN,
    })
});
const verifyUser = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    const token2 = req.cookies?.authToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(token);
    console.log(token2);
    if (token) {
        const decoded = await admin.auth().verifyIdToken(token);
        const email = decoded.email;
        const user = await User.findOne({ email }).select('-password').lean();
        if (!user) {
            throw new ApiError(401, 'User not found');

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
            throw new ApiError(401, 'User not found');

        }
        req.user = user;
        next();
    }

    if (!token && !token2) throw new ApiError(401, "Unauthorized ")


});

export  {verifyUser};