import { Request, Response } from 'express';
import { getShowtimes, getBookedSeats } from '../services/showtime.service';

const getShowtimesByFilter = async (req: Request, res: Response) => {
  try {
    const { movieId, cinemaId, date } = req.query;

    if (!movieId || !date) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ID phim và ngày xem!' });
    }

    const showTimes = await getShowtimes(
      movieId as string,
      cinemaId as string | undefined,
      date as string,
    );

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

const getSeats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Lấy showtimeId từ URL (/api/showtimes/123/seats)

    if (!id) {
      return res.status(400).json({ message: 'Thiếu ID suất chiếu!' });
    }

    const bookedSeats = await getBookedSeats(id as string);

    res.status(200).json({
      message: 'Lấy trạng thái ghế thành công!',
      data: bookedSeats, // Dữ liệu trả về sẽ là mảng: ['A1', 'B2']
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Lỗi máy chủ khi lấy trạng thái ghế!',
      error: error.message,
    });
  }
};

export { getShowtimesByFilter, getSeats };
