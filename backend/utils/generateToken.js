
import dotenv from "dotenv";
dotenv.config()

import jwt from "jsonwebtoken";

export const generateTokens = (userId) => {
    // Access token with a short lifespan
    const accessToken = jwt.sign(
        { id: userId }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "15m" } // Short-lived
    );

    // Refresh token with a longer lifespan
    const refreshToken = jwt.sign(
        { id: userId }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: "7d" } // Long-lived
    );

    return { accessToken, refreshToken };
};

