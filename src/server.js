import app from './app.js';
import { connectDatabase } from './database.js';
import config from './config.js';

const startServer = async () => {
    await connectDatabase();
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
};

startServer(); 