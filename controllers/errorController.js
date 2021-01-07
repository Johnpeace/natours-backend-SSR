const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const message = `Duplicate field value: ${error.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((element) => element.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // API
    return res.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  }
  // RENDERED WEBSITE
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message,
  });
};

const sendErrorProd = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    // API
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // Programming or other unknown error: don't leak this type of error to client but development only
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  if (error.isOperational) {
    // RENDERED WEBSITE
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errorObj = { ...error };
    errorObj.message = error.message;

    if (errorObj.kind === 'ObjectId') errorObj = handleCastErrorDB(errorObj);
    if (errorObj.code === 11000) errorObj = handleDuplicateFieldsDB(errorObj);
    if (errorObj._message === 'Validation failed')
      errorObj = handleValidationErrorDB(errorObj);
    if (errorObj.name === 'JsonWebTokenError') errorObj = handleJWTError();
    if (error.name === 'TokenExpiredError') errorObj = handleJWTExpiredError();

    sendErrorProd(errorObj, req, res);
  }
};
