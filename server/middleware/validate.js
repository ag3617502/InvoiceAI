const { errorResponse } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const details = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return errorResponse(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
  }
};

module.exports = validate;
