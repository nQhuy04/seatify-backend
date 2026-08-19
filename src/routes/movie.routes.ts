import { Router } from 'express';
import { getMovies, getMovie, createMovie } from '../controllers/movie.controller';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware';

const movieRouter = Router();

movieRouter.get('/', getMovies);
movieRouter.get('/:id', getMovie);

// Route thêm phim (Phải là Admin mới được gọi)
movieRouter.post('/', verifyToken, verifyAdmin, createMovie);

export default movieRouter;
