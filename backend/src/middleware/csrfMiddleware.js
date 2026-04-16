/**
 * Simple CSRF protection for cookie-authenticated state-changing endpoints.
 * Requires the `X-Requested-With: XMLHttpRequest` header on mutating requests.
 * Since browsers block custom headers on simple cross-origin requests without
 * CORS preflight + explicit server allowance, this effectively blocks classic
 * CSRF attacks from <form> POSTs or <img> GETs.
 */
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const requireCsrfHeader = (req, res, next) => {
  if (!MUTATING_METHODS.has(req.method)) return next();

  const header = req.get('X-Requested-With');
  if (!header || header.toLowerCase() !== 'xmlhttprequest') {
    return res.status(403).json({ message: 'CSRF check failed: missing X-Requested-With header' });
  }
  return next();
};

export default requireCsrfHeader;
