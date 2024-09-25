import config from '../config.js';
import * as authService from '../services/authService.js';

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            try {
                const decoded = authService.verifyToken(token, config.jwtSecret);
                req.user = decoded;

                // Check if user has required role
                if (roles.length && !roles.includes(decoded.role)) {
                    return res.status(403).send('Forbidden');
                }
                
                next();
            } catch (error) {
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('No token provided');
        }
    };
};

export default authMiddleware;
