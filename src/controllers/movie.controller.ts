import { Request, Response } from 'express';
import { getAllMovies, getMovieById } from '../services/movie.service';

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

const getMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movieId = String(id);
    const movie = await getMovieById(movieId);

    res.status(200).json({
      message: 'Lấy chi tiết phim thành công!',
      data: movie,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Lỗi máy chủ!' });
    }
  }
};

export { getMovies, getMovie };
