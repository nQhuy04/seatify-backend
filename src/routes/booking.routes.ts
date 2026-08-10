import { Router } from 'express';
import { holdBooking, getBooking } from '../controllers/booking.controller';

const bookingRouter = Router();

bookingRouter.post('/hold', holdBooking);
bookingRouter.get('/:id', getBooking);

export default bookingRouter;
