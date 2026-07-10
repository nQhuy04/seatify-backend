import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc vé không hợp lệ!' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

    (req as any).user = decoded; //req.user

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Vé thông hành giả hoặc đã hết hạn!' });
  }
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Bạn không phải là Admin!' });
  }
};
