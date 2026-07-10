import { Request, Response } from 'express';
import { getAllMovies } from '../services/movie.service';

const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await getAllMovies();

    res.status(200).json({
      message: 'Lấy danh sách phim thành công!',
      data: movies,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Lỗi máy chủ khi lấy danh sách phim!',
      error: error.message,
    });
  }
};

export { getMovies };
