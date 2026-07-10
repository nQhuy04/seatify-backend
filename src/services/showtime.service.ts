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

export { getShowtimes };
