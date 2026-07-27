import { Router } from 'express';
import { getMovies, getMovie } from '../controllers/movie.controller';

const movieRouter = Router();

movieRouter.get('/', getMovies);
movieRouter.get('/:id', getMovie);

export default movieRouter;
