import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin!' });
    }

    const newUser = await registerUser(email, password, fullName);

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      data: newUser,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin!' });
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export { register, login };
