import { app } from "./app";
import { errorHandler } from "./middlewares/error.middleware";
import { config } from "./config";


import { router } from "./routes";

import './events/listeners/studentListeners';
import { logger } from "./utils/logger";

logger.info("Student events registered.");

app.use("/api/v1", router);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

app.use(errorHandler);