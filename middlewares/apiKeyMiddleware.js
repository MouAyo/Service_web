// apiKeyMiddleware.js

const apiKey = '8f94826adab8ffebbeadb4f9e161b2dc';

const apiKeyMiddleware = (req, res, next) => {
  const providedApiKey = req.headers.authorization;
  if (providedApiKey && providedApiKey === `${apiKey}`) {
    next();
  } else {
    res.status(401).json({ error: 'Clé d\'API non valide' });
  }
};

module.exports = apiKeyMiddleware;
