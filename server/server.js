const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket/socketHandler');
const { sequelize } = require('./models');
const { startCronJobs } = require('./jobs/cronJobs');

const port = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(port, async () => {
  console.log(`Server listening on port ${port}`);

  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }

  startCronJobs();
});
