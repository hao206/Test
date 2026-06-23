const immutableAssetPattern = /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/i;

export const staticCache = () => (req, res, next) => {
  if (immutableAssetPattern.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return next();
  }

  if (req.path === '/' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache');
  }

  return next();
};
