import { Request, Response } from 'express';
import { getShowtimes } from '../services/showtime.service';

const getShowtimesByFilter = async (req: Request, res: Response) => {
  try {
    const { movieId, cinemaId, date } = req.query;

    if (!movieId || !cinemaId || !date) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin!' });
    }

    const showTimes = await getShowtimes(movieId as string, cinemaId as string, date as string);

    return res.status(200).json({
      message: 'Lấy danh sách suất chiếu thành công!',
      data: showTimes,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Lỗi máy chủ khi lấy suất chiếu!',
      error: error.message,
    });
  }
};

export { getShowtimesByFilter };
