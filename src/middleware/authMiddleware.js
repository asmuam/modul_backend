import config from '../config.js';
import * as authService from '../services/authService.js';
import sendResponse from '../utils/responseUtil.js'; // Import utilitas respons

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        const decoded = authService.verifyToken(token, config.jwtSecret);
        req.user = decoded;

        // Check if user has required role
        if (roles.length && !roles.includes(decoded.role)) {
          return sendResponse(res, 403, 'Forbidden');
        }

        next();
      } catch (error) {
        return sendResponse(res, 401, 'Unauthorized', error);
      }
    } else {
      return sendResponse(res, 401, 'No token provided');
    }
  };
};

export default authMiddleware;
