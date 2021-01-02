module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// const asyncHandler = fn => (req, res, next) =>
//   Promise
//     .resolve(fn(req, res, next))
//     .catch((err)=>res.status(404).send(err);)
