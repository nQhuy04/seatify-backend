import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getShowtimes = async (movieId: string, cinemaId: string, dateString: string) => {
  const startDate = new Date(dateString);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  const showtimes = await prisma.showtime.findMany({
    where: {
      movieId: movieId,

      room: {
        cinemaId: cinemaId,
      },

      startTime: {
        gte: startDate,
        lt: endDate,
      },
    },

    orderBy: {
      startTime: 'asc',
    },

    include: {
      room: true,
      _count: {
        select: {
          ticketSeats: {
            where: {
              status: {
                in: ['HOLDING', 'BOOKED'],
              },
            },
          },
        },
      },
    },
  });

  const result = showtimes.map((st) => {
    const soldSeats = st._count.ticketSeats;
    const totalSeats = st.room.totalSeats;

    return {
      id: st.id,
      startTime: st.startTime,
      endTime: st.endTime,
      roomName: st.room.name,
      totalSeats: totalSeats,
      soldSeats: soldSeats,

      isFull: soldSeats >= totalSeats,
    };
  });

  return result;
};

// Hàm lấy danh sách ghế ĐÃ BÁN hoặc ĐANG GIỮ CHỖ của 1 suất chiếu
const getBookedSeats = async (showtimeId: string) => {
  // 1. Tìm các vé (TicketSeat) của suất chiếu này
  const ticketSeats = await prisma.ticketSeat.findMany({
    where: {
      showtimeId: showtimeId,
      status: {
        in: ['BOOKED', 'HOLDING'], // Chỉ lấy vé đã bán hoặc đang bị người khác giữ
      },
    },
    // JOIN sang bảng Seat vật lý để lấy cái 'row' (A) và 'number' (1)
    include: {
      seat: true,
    },
  });

  // 2. Ép kiểu dữ liệu (Mapping)
  // Biến mảng Object rườm rà thành một mảng chuỗi đơn giản: ['A1', 'B2', 'C3']
  const bookedSeatIds = ticketSeats.map((ts) => {
    return `${ts.seat.row}${ts.seat.number}`;
  });

  return bookedSeatIds;
};

export { getShowtimes, getBookedSeats };
