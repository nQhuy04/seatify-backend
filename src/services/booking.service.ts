import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
}

const holdSeats = async (
  showtimeId: string,
  seatNames: string[],
  guestInfo: GuestInfo,
  totalPrice: number,
  userId?: string,
) => {
  // 1. Phân tách mảng tên ghế ['A1', 'B2'] thành Row và Number để tìm trong DB
  // VD: 'A1' -> row: 'A', number: 1
  const seatConditions = seatNames.map((name) => ({
    row: name.charAt(0),
    number: parseInt(name.slice(1)),
  }));

  // MỞ TRANSACTION: Đảm bảo luật ALL or NOTHING (Thành công hết hoặc hủy hết)
  return await prisma.$transaction(async (tx) => {
    // 2. Tìm ID của các ghế vật lý trong phòng dựa vào Row và Number
    const physicalSeats = await tx.seat.findMany({
      where: { OR: seatConditions },
    });

    if (physicalSeats.length !== seatNames.length) {
      throw new Error('Một số ghế không tồn tại trong phòng chiếu này!');
    }

    const physicalSeatIds = physicalSeats.map((s) => s.id);

    // 3. Tìm các vé (TicketSeat) tương ứng với suất chiếu và các ghế vật lý trên
    const ticketSeats = await tx.ticketSeat.findMany({
      where: {
        showtimeId: showtimeId,
        seatId: { in: physicalSeatIds },
      },
    });

    const ticketSeatIds = ticketSeats.map((ts) => ts.id);

    // ====================================================================
    // 4. PESSIMISTIC LOCKING (KHÓA BI QUAN BẰNG RAW SQL)
    // Lệnh này ép PostgreSQL khóa cứng các dòng TicketSeat này lại.
    // Nếu có 2 Request gọi cùng 1 mili-giây, 1 thằng sẽ bị bắt đứng xếp hàng chờ!
    // ====================================================================
    const lockedTicketSeats = await tx.$queryRaw<any[]>`
      SELECT id, status, "lockedUntil" 
      FROM "TicketSeat" 
      WHERE id IN (${Prisma.join(ticketSeatIds)}) 
      FOR UPDATE
    `;

    // 5. Kiểm tra xem có ghế nào đã bị người khác nẫng tay trên không?
    const now = new Date();
    for (const ts of lockedTicketSeats) {
      // Ghế đã BÁN, hoặc đang HOLDING và chưa hết hạn 5 phút
      if (ts.status === 'BOOKED' || (ts.status === 'HOLDING' && ts.lockedUntil > now)) {
        throw new Error('Rất tiếc! Ghế bạn chọn hiện đã có người chọn. Vui lòng chọn ghế khác!');
      }
    }

    // 6. TẤT CẢ GHẾ ĐỀU AN TOÀN -> TẠO HÓA ĐƠN NHÁP
    const newBooking = await tx.booking.create({
      data: {
        userId: userId || null, //Kết nối với hóa đơn khách
        guestName: guestInfo.fullName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        totalPrice: totalPrice,
        status: 'PENDING', // Đang chờ thanh toán
      },
    });

    // 7. CẬP NHẬT TRẠNG THÁI VÉ -> GIỮ CHỖ 5 PHÚT
    const holdExpirationTime = new Date(now.getTime() + 5 * 60000); // Hiện tại + 5 phút

    await tx.ticketSeat.updateMany({
      where: { id: { in: ticketSeatIds } },
      data: {
        status: 'HOLDING',
        lockedUntil: holdExpirationTime,
        bookingId: newBooking.id,
      },
    });

    // Trả về ID của hóa đơn để Frontend chuyển sang trang Thanh toán
    return newBooking;
  });
};

const getBookingById = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    // Dùng phép thuật JOIN sâu 4 tầng của Prisma để lôi toàn bộ thông tin lên mặt đất!
    include: {
      ticketSeats: {
        include: {
          seat: true,
          showtime: {
            include: { movie: true, room: { include: { cinema: true } } },
          },
        },
      },
    },
  });

  if (!booking) throw new Error('Không tìm thấy hóa đơn này!');
  return booking;
};

const getMyBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: userId }, // Chỉ lấy hóa đơn của ông này
    orderBy: { createdAt: 'desc' }, // Xếp hóa đơn mới nhất lên đầu
    include: {
      ticketSeats: {
        include: {
          showtime: {
            include: { movie: true, room: { include: { cinema: true } } },
          },
        },
      },
    },
  });
  return bookings;
};

export { holdSeats, getBookingById, getMyBookings };
