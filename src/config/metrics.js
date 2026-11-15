const client = require('prom-client');

const register = new client.Registry();

// Collect default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Custom metric: total HTTP requests counter
const httpRequestCounter = new client.Counter({
  name: 'blog_http_requests_total',
  help: 'Total HTTP requests processed by the Blog REST API',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Middleware to monitor request counts
const metricsMiddleware = (req, res, next) => {
  res.on('finish', () => {
    if (req.path !== '/metrics') {
      httpRequestCounter.inc({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status: res.statusCode,
      });
    }
  });
  next();
};

const getMetricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
};

module.exports = {
  register,
  httpRequestCounter,
  metricsMiddleware,
  getMetricsHandler,
};
