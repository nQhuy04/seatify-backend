import { Router } from 'express';
import { getShowtimesByFilter, getSeats } from '../controllers/showtime.controller';

const showtimeRouter = Router();

showtimeRouter.get('/', getShowtimesByFilter);
showtimeRouter.get('/:id/seats', getSeats);

export default showtimeRouter;
