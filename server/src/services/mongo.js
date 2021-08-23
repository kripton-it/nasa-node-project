const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('MongoDB connected successfully!')
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function connectMongoDB() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });
}

async function disconnectMongoDB() {
  await mongoose.disconnect();
}

module.exports = { connectMongoDB, disconnectMongoDB }