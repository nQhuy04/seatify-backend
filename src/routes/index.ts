import { Router } from 'express';
import authRouter from './auth.routes';
import movieRouter from './movie.routes';
import cinemaRouter from './cinema.routes';
import showtimeRouter from './showtime.routes';

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/movies', movieRouter);
rootRouter.use('/cinemas', cinemaRouter);
rootRouter.use('/showtimes', showtimeRouter);

export default rootRouter;
