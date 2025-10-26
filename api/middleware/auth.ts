import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (roles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res
          .status(500)
          .json({ error: "Server misconfiguration: JWT_SECRET not set" });
      }

      const decoded: any = jwt.verify(token, secret);
      if (roles && !roles.includes(decoded.role))
        return res.status(403).json({ error: "Forbidden" });

      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};
