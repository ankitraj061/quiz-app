import { Worker } from "worker_threads";
import path from "path";
import { CertificateGeneratorPayload } from "../types/quiz.types";
import { DbOperationPayload } from "./databaseWorker";
import { logger } from "../utils/logger";

let certWorker: Worker;
let databaseWorker: Worker;

export function startWorkers() {
    certWorker = new Worker(path.join(__dirname, "certificateWorker.js"));
    databaseWorker = new Worker(path.join(__dirname, "databaseWorker.js"));

    certWorker.on("message", (msg) => {
        console.log("Message from certificate generator worker:", msg);
        if (msg.status === "done") {
            logger.info("Pushing task to the DB worker.");
            pushDbOperationTaks({
                quizId: msg.quizId,
                pdfUrl: msg.pdfUrl,
                studentId: msg.studentId,
            });
        } 
    });

    certWorker.on("error", (err) => {
        console.error("Certificate generator Worker error:", err);
    });

    certWorker.on("exit", (code) => {
        console.log("Certificate generator Worker exited:", code);
    });

    databaseWorker.on("message", (msg) => {
        console.log("Message from database worker:", msg);
    });

    databaseWorker.on("error", (err) => {
        console.error("Database Worker error:", err);
    });

    databaseWorker.on("exit", (code) => {
        console.log("Database Worker exited:", code);
    });
}

export function pushCertificateTask(data: CertificateGeneratorPayload) {
    certWorker.postMessage(data);
}

export function pushDbOperationTaks(data: DbOperationPayload) {
    logger.info("Received task", { data });
    databaseWorker.postMessage(data);
}
