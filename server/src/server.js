const { createServer } = require('http');

require('dotenv').config();

const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');
const { connectMongoDB } = require('./services/mongo');

const PORT = process.env.PORT || 8000;

const server = createServer(app);

async function startServer() {
  await connectMongoDB();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
