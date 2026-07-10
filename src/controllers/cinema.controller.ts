import { Request, Response } from 'express';
import { getAllCinemas } from '../services/cinema.service';

const getCinemas = async (req: Request, res: Response) => {
  try {
    const cinemas = await getAllCinemas();

    res.status(200).json({
      message: 'Lấy danh sách Rạp chiếu thành công!',
      data: cinemas,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Lỗi máy chủ khi lấy danh sách rạp!',
      data: error.message,
    });
  }
};

export { getCinemas };
