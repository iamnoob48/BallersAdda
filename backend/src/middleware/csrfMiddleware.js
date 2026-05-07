const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const ALLOWED_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

export const requireCsrfHeader = (req, res, next) => {
  if (!MUTATING_METHODS.has(req.method)) return next();

  // Layer 1: reject if Origin header is present but doesn't match our frontend.
  // Browsers always send Origin on cross-origin requests; server-to-server calls
  // and same-origin requests either omit it or match — both are fine.
  const origin = req.get('Origin');
  if (origin && origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ message: 'CSRF check failed: origin not allowed' });
  }

  // Layer 2: custom header — browsers block these on simple requests without preflight.
  const header = req.get('X-Requested-With');
  if (!header || header.toLowerCase() !== 'xmlhttprequest') {
    return res.status(403).json({ message: 'CSRF check failed: missing X-Requested-With header' });
  }

  return next();
};

export default requireCsrfHeader;
