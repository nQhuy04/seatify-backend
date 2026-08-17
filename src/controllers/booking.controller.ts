import { Request, Response } from 'express';
import {
  holdSeats,
  getBookingById,
  getMyBookings,
  cancelBooking,
} from '../services/booking.service';

const holdBooking = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatNames, guestInfo, totalPrice, userId } = req.body;

    if (!showtimeId || !seatNames || seatNames.length === 0 || !guestInfo || !totalPrice) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt vé!' });
    }

    const booking = await holdSeats(showtimeId, seatNames, guestInfo, totalPrice, userId);

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

const getBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id as string);
    res.status(200).json({ message: 'Lấy hóa đơn thành công', data: booking });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Lỗi server' });
  }
};

const getMyHistory = async (req: Request, res: Response) => {
  try {
    // Ông verifyToken đã nhét user vào req rồi, ta chỉ việc lấy ra xài
    const userId = (req as any).user.userId;
    const bookings = await getMyBookings(userId);

    res.status(200).json({ message: 'Lấy lịch sử thành công', data: bookings });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi server' });
  }
};

const cancelBookingController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await cancelBooking(id as string);
    res.status(200).json({ message: 'Đã hủy đơn hàng và nhả ghế thành công!' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Lỗi server khi hủy đơn!' });
    }
  }
};

export { holdBooking, getBooking, getMyHistory, cancelBookingController };
