import { Request, Response } from 'express';
import { holdSeats, getBookingById } from '../services/booking.service';

export const holdBooking = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatNames, guestInfo, totalPrice } = req.body;

    if (!showtimeId || !seatNames || seatNames.length === 0 || !guestInfo || !totalPrice) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt vé!' });
    }

    const booking = await holdSeats(showtimeId, seatNames, guestInfo, totalPrice);

    res.status(201).json({
      message: 'Giữ ghế thành công! Vui lòng thanh toán trong 5 phút.',
      data: booking,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Lỗi hệ thống khi giữ ghế!' });
    }
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id as string);
    res.status(200).json({ message: 'Lấy hóa đơn thành công', data: booking });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Lỗi server' });
  }
};
