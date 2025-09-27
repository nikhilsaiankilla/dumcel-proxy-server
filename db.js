const mongoose = require("mongoose");

const { getSecrets } = require('./utils/secrets')

async function connectDb() {
    const secrets = await getSecrets();

    if (mongoose.connection.readyState === 1) {
        console.log("Already connected to MongoDB.");
        return;
    }

    try {
        const URI = secrets?.mongoDb_uri || process.env.MONGO_DB_URI;
        await mongoose.connect(URI);
        console.log("Successfully connected to MongoDB!");

    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

// Optional: Close the connection when the app exits
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
});

module.exports = {
    connectDb,
};