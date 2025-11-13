export type ApiErrorResponse = {
    success: boolean,
    statusCode: number,
    message: string,
    timeStamp: Date,
    path: string,
    errors: string[]
}

export type ApiSuccessReponse<T> = {
    success: boolean,
    message: string,
    data: T,
    timestamp: Date,
}

export type LoginData = {
    token: string
}