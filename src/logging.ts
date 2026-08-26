import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

export function requestLogger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // Log request
  console.log(`[info] ${new Date().toISOString()} | ${method} ${path} | IP: ${ip}`);

  // Capture original json method
  const originalJson = res.json;

  // Override res.json to log response
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determine log level based on status code
    let logLevel = '[info]';
    if (statusCode >= 400) logLevel = '[warn]';
    if (statusCode >= 500) logLevel = '[error]';

    // Log response with user info if available
    const userInfo = req.user ? `User: ${req.user.email}` : 'Guest';

    // Don't log sensitive data
    const safeData = JSON.stringify(data).replace(/"token":"[^"]*"/g, '"token":"[REDACTED]"');

    console.log(`${logLevel} ${new Date().toISOString()} | ${method} ${path} | Status: ${statusCode} | ${responseTime}ms | ${userInfo}`);

    return originalJson.call(this, data);
  };

  next();
}