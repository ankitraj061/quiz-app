import { EventEmitter } from "events";

export const appEventEmitter = new EventEmitter();

// Event types
export enum AppEvents {
    STUDENT_REGISTERED = 'student:registered',
    SEND_EMAIL_VERIFICATION = 'email:verification:sent',
}
