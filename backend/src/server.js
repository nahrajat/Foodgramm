require('dotenv').config();
const app = require('./app');
const connectDb = require('./db/db');

const port = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();