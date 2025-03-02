export class ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
  
    constructor(success: boolean, data?: T, message?: string) {
      this.success = success;
      if (data !== undefined) {
        this.data = data;
      }
      if (message !== undefined) {
        this.message = message;
      }
    }
  
    static success<T>(data: T): ApiResponse<T> {
      return new ApiResponse<T>(true, data);
    }
  
    static error(message: string): ApiResponse<null> {
      return new ApiResponse<null>(false, undefined, message);
    }
  }
  