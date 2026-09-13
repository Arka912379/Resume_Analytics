import verifyUser from '../utils/userVerifyForSocket.js';
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const socketAuthMiddleware = asyncHandler(async (socket, next) => {
    const { token, authType } = socket.handshake.auth;

    if (!token || !authType) { 
        throw new ApiError(401, "Unauthorized: Missing token or authType");
    }

    if (authType !== "firebase" && authType !== "normal") {
        throw new ApiError(400, "Bad Request: Invalid authType");
    }

    const user = await verifyUser(token, authType);
    if (!user) {
        throw new ApiError(401, "Unauthorized: Invalid token");
    }

    socket.user = user;
    next();
})

export { socketAuthMiddleware };