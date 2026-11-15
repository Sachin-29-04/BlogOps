require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Blog API Service running on http://localhost:${PORT}`);
  console.log(` Swagger API Docs:      http://localhost:${PORT}/api-docs`);
  console.log(` Prometheus Metrics:    http://localhost:${PORT}/metrics`);
  console.log(` Health Check:          http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
