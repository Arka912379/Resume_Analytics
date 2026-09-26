import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({
    credential: cert({
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
const verifyUser = async (token, authType) => {
    let email;

    if (authType == "firebase") {
        const decoded = await getAuth().verifyIdToken(token);
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