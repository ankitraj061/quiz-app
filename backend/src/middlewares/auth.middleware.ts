import { verifyToken } from "../utils/jwtUtils";
import { NextFunction, Request, Response } from "express";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.clearCookie('auth_token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

