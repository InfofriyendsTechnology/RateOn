export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: any;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}
