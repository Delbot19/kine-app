const zodValidator = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (result.success) {
    next();
    return;
  }

  const errors = {};

  result.error.issues.forEach((issue) => {
    errors[issue.path[1]] = issue.message;
  });
  return res.status(500).json({
    success: result.success,
    errors,
  });
};

export default zodValidator;
