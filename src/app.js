const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { metricsMiddleware, getMetricsHandler } = require('./config/metrics');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');

const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Prometheus Metrics Middleware
app.use(metricsMiddleware);

// Observability Endpoints
app.get('/metrics', getMetricsHandler);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);
app.use(postRoutes);
app.use(commentRoutes);

app.use(errorHandler);

module.exports = app;
