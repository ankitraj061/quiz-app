import { app } from "./app";
import { errorHandler } from "./middlewares/error.middleware";
import dotenv from "dotenv";
dotenv.config();

import { config } from "./config";


import { router } from "./routes";

import './events/listeners/studentListeners';
import { logger } from "./utils/logger";
import { startWorkers } from "./workers/workerManager";

logger.info("Student events registered.");
startWorkers();

app.use("/api/v1", router);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

app.use(errorHandler);