const jwt = require('jsonwebtoken');
const { Token } = require('../models/token');
const { User } = require('../models/user');

async function errorHandler(error, req, res, next) {
    // Handle express-jwt unauthorized errors
    if (error && error.name === 'UnauthorizedError') {
        // If it's not an expired token, return the error immediately
        if (!error.message || !error.message.toLowerCase().includes('jwt expired')) {
            return res.status(error.status || 401).json({ type: error.name, message: error.message || 'Unauthorized' });
        }

        try {
            // Read header safely
            const tokenHeader = req.headers && (req.headers['authorization'] || req.get && req.get('Authorization'));
            const accessToken = tokenHeader?.split(' ')[1];
            const token = await Token.findOne({ accessToken, refreshToken: { $exists: true } });
            if (!token) {
                return res.status(401).json({ type: 'Unauthorized', message: 'Token does not exist' });
            }

            const userData = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findById(userData.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const newAccessToken = jwt.sign(
                { id: user.id, isAdmin: user.isAdmin },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '24h' }
            );

            // Update request and token store with new access token
            req.headers = req.headers || {};
            req.headers['authorization'] = `Bearer ${newAccessToken}`;

            await Token.updateOne({ _id: token._id }, { accessToken: newAccessToken }).exec();

            // Expose new access token to client
            res.set('Authorization', `Bearer ${newAccessToken}`);

            // Call next to retry the request with refreshed token
            return next();

        } catch (refreshError) {
            console.error('Refresh token error:', refreshError);
            return res.status(401).json({ type: 'Unauthorized', message: refreshError.message || 'Failed to refresh token' });
        }
    }

    // For other errors, forward to default error handler or send generic response
    return next(error);
}

module.exports = errorHandler;