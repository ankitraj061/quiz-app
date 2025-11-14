import { Response } from 'express';



export class ApiResponse {
  /**
   * Send a success response, default code : 200
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation completed successfully',
    statusCode: number = 200,
  ) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    
    res.status(statusCode).json(response);
    return;
  }
}
