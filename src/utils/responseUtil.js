// utils/responseUtil.js

const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status: status < 400 ? 'success' : 'error',
    message,
    data,
  });
};

export default sendResponse;
