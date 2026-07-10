import { Router } from 'express';
import { getShowtimesByFilter } from '../controllers/showtime.controller';

const showtimeRouter = Router();

showtimeRouter.get('/', getShowtimesByFilter);

export default showtimeRouter;
