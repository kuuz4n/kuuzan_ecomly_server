const {expressjwt: expjwt} = require('express-jwt');

const {Token} = require('../models/token');

function authJwt() {
    const API = process.env.API_URL;

    return expjwt({
        secret: process.env.ACCESS_TOKEN_SECRET,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
        // http://kevonecomly.com/login
    }).unless({
        path: [
            `${API}/login`,
            `${API}/login/`,

            `${API}/register`,
            `${API}/register/`, 

            `${API}/verify-token`,
            `${API}/verify-token/`, 

            `${API}/forgot-password`,
            `${API}/forgot-password/`,

            `${API}/verify-otp`,
            `${API}/verify-otp/`,

            `${API}/reset-password`,
            `${API}/reset-password/`,
        ]
    });

}

async function isRevoked(req, tokenPayload) {
    // Header names are lower-cased in Node.js
    const authHeader = req.headers && (req.headers['authorization'] || req.get && req.get('Authorization'));

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return true;
    }

    const accessToken = authHeader.split(' ')[1].trim();
    const tokenDoc = await Token.findOne({ accessToken });

    const adminRouteRegex = /^\/api\/v1\/admin(\/|$)/;
    const adminFault = !tokenPayload?.isAdmin && adminRouteRegex.test(req.originalUrl);

    return !tokenDoc || adminFault;

}

module.exports = authJwt;