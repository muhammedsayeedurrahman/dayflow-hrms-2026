import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

const isDev = process.env.NODE_ENV !== 'production';

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // In development, log full stack trace; in production, log minimal info
  if (isDev) {
    console.error(`[${new Date().toISOString()}] ❌ ${req.method} ${req.path}`, {
      statusCode,
      message,
      stack: err.stack,
    });
  } else {
    console.error(`[${new Date().toISOString()}] ❌ ${statusCode} ${req.method} ${req.path} — ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.errors && { errors: err.errors }),
      // Only include stack in development
      ...(isDev && err.stack && { stack: err.stack }),
    },
  });
};

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
